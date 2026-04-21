# MR Worldwide — Backend Specification

**Stack:** Spring Boot 3 · Java 21 · PostgreSQL · JWT (HS512) · MapStruct · Caffeine Cache  
**Base package:** `com.raf.mrworldwide`  
**Figma:** [UI Design](https://www.figma.com/make/dLEBxkGaXWjlp2X0uhydds/MR-Worldwide?t=GnRp6yGwR1MXWVxV-1)

---

## 1\. Application Overview

**MR Worldwide** is an AI-assisted multi-destination trip planning REST API. A user creates a `TripPlan` composed of ordered `TripSegment`s (destination hops). Each segment carries optional `Transport` (airplane or vehicle) and `Accommodation`, plus a list of timestamped `DailyItinerary` activities. Registered users additionally benefit from a personal `UserTripPreference` profile that feeds AI-generated recommendations, and can share plans with other users.

---

## 2\. User Roles

| Role | Enum value | Description |
| :---- | :---- | :---- |
| Regular User | `REGULAR_USER` | Standard registered account; full feature access |
| System Admin | `SYSTEM_ADMIN` | Platform operations; can manage users |
| Super Admin | `SUPER_ADMIN` | Full admin access; all system capabilities |

**Note:** Guest (unauthenticated) access is handled purely on the **frontend** by using a local-only flow before requiring registration. The backend does not issue guest tokens. All state-persisting endpoints require authentication.

---

## 3\. Authentication & Authorization

### 3.1 Token Strategy

- Stateless JWT (HS512, 30-day expiry).  
- Token is returned inside `UserDto.accessToken` on login.  
- All subsequent requests must include `Authorization: Bearer <token>`.

### 3.2 Public Endpoints (no token required)

| Method | Path | Description |
| :---- | :---- | :---- |
| `POST` | `/api/users/login` | Authenticate and receive JWT |
| `POST` | `/api/users/register` | Create a new account |
| `POST` | `/api/users/forgot-password` | Initiate password reset flow |
| `POST` | `/api/users/reset-password` | Confirm password reset with token |
| `OPTIONS` | `/**` | CORS preflight |
| `GET` | `/actuator/health` | Health probe |

### 3.3 Ownership Check Pattern

Every write or read operation on user-owned resources must verify that:

AuthUtils.getLoggedUser().getEmail().equals(entity.getCreatedBy())

Violations throw `ForbiddenException` (403).

---

## 4\. Data Model

All entities extend `BaseEntityUUID` → `BaseEntityAudit`.  
`BaseEntityUUID` provides `id` (UUID, PK) and `version` (optimistic lock).  
`BaseEntityAudit` provides `createdOn`, `updatedOn`, `createdBy`, `lastModifiedBy` (auto-populated by JPA auditing).

### 4.1 User

**Entity:** `domain/entities/user/User.java`

| Field | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | UUID | PK, generated | Inherited from `BaseEntityUUID` |
| `email` | String | unique, not null | Login identifier |
| `password` | String | not null, write-only | BCrypt hashed |
| `firstName` | String | not null | User's first name |
| `lastName` | String | not null | User's last name |
| `role` | `Role` | not null | `REGULAR_USER` / `SYSTEM_ADMIN` / `SUPER_ADMIN` |
| `deleted` | Boolean | default `false` | Soft-delete flag |
| `userTripPreference` | `UserTripPreference` | OneToOne, nullable | User's global travel profile |

**Business rules:**

- On register: `role` is always set to `REGULAR_USER`; password is BCrypt-encoded.  
- Soft-delete: `deleted = true` disables login (`ForbiddenException` thrown in `AuthService.login`).  
- Email lookup is case-insensitive (`findByEmailIgnoreCase`).

---

### 4.2 UserTripPreference

**Entity:** `domain/entities/user/UserTripPreference.java`

| Field | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | UUID | PK | Inherited |
| `name` | String | nullable | Label for this preference profile |
| `interests` | `List<String>` | TEXT/CSV | e.g., `MUSEUMS`, `NIGHTLIFE`, `NATURE`, `FOOD`, `SHOPPING` |
| `hobbies` | `List<String>` | TEXT/CSV | User's personal hobbies |
| `favouriteDestinations` | `List<String>` | TEXT/CSV | Preferred destination names |
| `user` | `User` | OneToOne (mapped by) | Back-reference to owner |

Stored as comma-separated values via `@Convert(converter = CsvConverter.class)`.

**Business rules:**

- One preference profile per user.  
- When a user fills in the travel survey during trip creation, this entity is created/updated.  
- The AI assistant uses this profile to personalize recommendations.  
- If a preference profile already exists, it can be reused during trip creation or updated.

---

### 4.3 TripPlan

**Entity:** `domain/entities/trip/TripPlan.java`

| Field | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | UUID | PK | Inherited |
| `name` | String | nullable | User-defined trip name |
| `destinations` | `List<String>` | TEXT/CSV | Summary list of destination names |
| `startDate` | `LocalDate` | nullable | Overall trip start date |
| `endDate` | `LocalDate` | nullable | Overall trip end date |
| `interests` | `List<String>` | TEXT/CSV | Per-trip interests used for activity suggestions |
| `status` | `TripPlanStatus` | nullable | `DRAFT` / `PLANNED` / `BOOKED` / `COMPLETED` |
| `user` | `User` | ManyToOne, FK `user_id` | Owner |
| `tripSegments` | `List<TripSegment>` | OneToMany, cascadeAll, ordered by `orderIndex` ASC | Ordered destination hops |

**Status transitions:**

DRAFT → PLANNED → BOOKED → COMPLETED

**Business rules:**

- `startDate` is derived from the arrival date of the first `TripSegment`.  
- `endDate` is derived from the departure date of the last `TripSegment`.  
- Date continuity validation: the `departureDate` of segment N must equal the `arrivalDate` of segment N+1.  
- `destinations` (CSV) is a denormalized list kept in sync with `TripSegment.destination` values for quick display.  
- Only the owning user may view or mutate the plan.

---

### 4.4 TripSegment

**Entity:** `domain/entities/trip/TripSegment.java`

| Field | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | UUID | PK | Inherited |
| `departure` | String | nullable | Departure city/location name |
| `destination` | String | nullable | Destination city/location name |
| `arrivalDate` | `LocalDate` | nullable | Date of arrival at destination |
| `departureDate` | `LocalDate` | nullable | Date of departure from destination |
| `orderIndex` | Integer | nullable | Position in the trip sequence (0-based) |
| `destinationLatitude` | Double | nullable | Geo-coordinate of destination |
| `destinationLongitude` | Double | nullable | Geo-coordinate of destination |
| `tripPlan` | `TripPlan` | ManyToOne (lazy), FK `trip_plan_id` | Parent plan |
| `transport` | `Transport` | OneToOne, nullable | Transport used to reach this destination |
| `accommodation` | `Accommodation` | OneToOne, nullable | Accommodation at this destination |
| `dailyItineraries` | `List<DailyItinerary>` | OneToMany, cascadeAll | Scheduled activities during the stay |

**Business rules:**

- When a new segment is appended, `orderIndex` \= current segment count.  
- `arrivalDate` of the new segment must equal `departureDate` of the previous segment.  
- `Transport` and `Accommodation` are optional at creation; they can be added or updated later.  
- Deleting a segment removes all child `DailyItinerary`, `Transport`, and `Accommodation` records (cascade).

---

### 4.5 Transport

**Entity:** `domain/entities/transport/Transport.java`

| Field | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | UUID | PK | Inherited |
| `transportType` | `TransportType` | EnumString | `AIRPLANE` / `TRAIN` / `VEHICLE` |
| `airplaneTransport` | `AirplaneTransport` | OneToOne, nullable | Populated when type is `AIRPLANE` |
| `vehicleTransport` | `VehicleTransport` | OneToOne, nullable | Populated when type is `VEHICLE` |
| `tripSegment` | `TripSegment` | OneToOne (mapped by) | Back-reference |

**Business rules:**

- Exactly one of `airplaneTransport` or `vehicleTransport` must be non-null, matching `transportType`.  
- `TRAIN` type is reserved for future implementation; no detail entity exists yet.  
- A `Transport` record is created/replaced atomically when the user selects transport for a segment.

---

### 4.6 AirplaneTransport

**Entity:** `domain/entities/transport/AirplaneTransport.java`

| Field | Type | Description |
| :---- | :---- | :---- |
| `id` | UUID | Inherited |
| `flightNumber` | String | IATA flight number (e.g., `JU 204`) |
| `departureTime` | `LocalDateTime` | Local departure date-time |
| `arrivalTime` | `LocalDateTime` | Local arrival date-time |
| `duration` | String | Human-readable duration (e.g., `2h 15m`) |
| `price` | Double | Ticket price |
| `currency` | String | ISO currency code (e.g., `EUR`) |

**Business rules:**

- **Late-night landing logic:** If `arrivalTime` is between `22:00` and `05:59`, the system suggests pushing `Accommodation.checkIn` back one day to allow immediate room access.  
- Flight search results are retrieved via an external flights API (Amadeus or similar); results are not persisted until the user selects a flight.

---

### 4.7 VehicleTransport

**Entity:** `domain/entities/transport/VehicleTransport.java`

| Field | Type | Description |
| :---- | :---- | :---- |
| `id` | UUID | Inherited |
| `distanceKm` | Double | Total route distance in kilometres |
| `estimatedFuelCost` | Double | Estimated fuel cost |
| `tollCost` | Double | Estimated toll/motorway cost |

**Business rules:**

- Distance, fuel cost, and toll cost are calculated server-side via a routing API (e.g., Google Maps Distance Matrix or HERE Routing).  
- Calculation is triggered when the user selects "own vehicle" for a segment.

---

### 4.8 Accommodation

**Entity:** `domain/entities/accomodation/Accommodation.java`

| Field | Type | Description |
| :---- | :---- | :---- |
| `id` | UUID | Inherited |
| `name` | String | Hotel / apartment / "staying with friends" |
| `address` | String | Full address |
| `imageUrl` | String | Preview image URL |
| `bookingUrl` | String | Deep-link to booking platform (optional) |
| `starRating` | Double | 1–5 star rating |
| `reviewScore` | Double | Aggregate review score |
| `checkIn` | `LocalDate` | Auto-filled from `TripSegment.arrivalDate` |
| `checkOut` | `LocalDate` | Auto-filled from `TripSegment.departureDate` |
| `priceTotal` | Double | Total stay cost |
| `currency` | String | ISO currency code |
| `tripSegment` | `TripSegment` | OneToOne (mapped by) |

**Business rules:**

- `checkIn` / `checkOut` are auto-populated from the parent `TripSegment` dates when the accommodation is first attached; they can be overridden manually.  
- If the linked segment has a late-night arriving flight (see late-night landing logic above), `checkIn` is auto-shifted back by one day.  
- A user can enter a custom/own accommodation (no `bookingUrl`, no rating); in this case `bookingUrl`, `starRating`, and `reviewScore` are `null`.  
- Accommodation search results from an external provider (Booking.com API or similar) are not persisted until the user selects one.

---

### 4.9 DailyItinerary

**Entity:** `domain/entities/trip/DailyItinerary.java`

| Field | Type | Description |
| :---- | :---- | :---- |
| `id` | UUID | Inherited |
| `name` | String | Name of the activity or place |
| `category` | String | Category label (e.g., `MUSEUM`, `PARK`, `SQUARE`, `NIGHTLIFE`, `FOOD`) |
| `categoryIconUrl` | String | URL of the icon representing the category |
| `address` | String | Full address of the location |
| `latitude` | Double | Geo-coordinate |
| `longitude` | Double | Geo-coordinate |
| `day` | `LocalDate` | Calendar day on which the activity is scheduled |
| `startTime` | `LocalTime` | Activity start time |
| `endTime` | `LocalTime` | Activity end time |
| `tripSegment` | `TripSegment` | ManyToOne (lazy), FK `trip_segment_id` |

**Business rules:**

- `day` must fall within `[TripSegment.arrivalDate, TripSegment.departureDate)`.  
- Activities are generated by the AI assistant based on the segment's destination and `TripPlan.interests`.  
- Time-slot overlap validation: two activities in the same segment on the same day must not have overlapping `[startTime, endTime]` ranges.  
- Opening-hours validation: the system must not suggest or allow scheduling a location outside its known operating hours (sourced from Google Places API or similar).

---

### 4.10 AIInteraction *(to be implemented)*

**Entity to create:** `domain/entities/ai/AIInteraction.java`

| Field | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | UUID | PK | Inherited from `BaseEntityUUID` |
| `tripPlan` | `TripPlan` | ManyToOne, FK `trip_plan_id` | Conversation belongs to this plan |
| `user` | `User` | ManyToOne, FK `user_id` | Author of the message |
| `message` | `TEXT` | not null | Content of the message |
| `senderType` | `SenderType` enum | not null | `USER` or `AI` |
| `timestamp` | `ZonedDateTime` | not null | When the message was sent |

**Business rules:**

- The AI has full read access to the associated `TripPlan` (segments, transport, accommodation, itineraries) to provide context-aware answers.  
- Message history is persisted per plan; the full conversation history for the plan is sent as context to the LLM on every new message.  
- The AI may proactively suggest itinerary adjustments when it detects conflicts (e.g., overlapping times, closed venues).

---

### 4.11 PlanShare *(to be implemented)*

**Entity to create:** `domain/entities/trip/PlanShare.java`

| Field | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | UUID | PK | Inherited |
| `tripPlan` | `TripPlan` | ManyToOne, FK `trip_plan_id` | Plan being shared |
| `sharedWithUser` | `User` | ManyToOne, FK `shared_with_user_id` | Invited user |
| `accessType` | `AccessType` enum | not null | `READ_ONLY` / `EDITOR` |
| `inviteSentAt` | `ZonedDateTime` | not null | Timestamp of the invitation |

**Business rules:**

- Only the plan owner (`createdBy`) may share the plan.  
- A plan cannot be shared with its owner.  
- A `READ_ONLY` recipient can view all plan details but cannot modify anything.  
- `EDITOR` access is reserved for a future version; backend should accept the enum value but treat it the same as `READ_ONLY` until editor logic is built.  
- Sharing by email: the requester provides the email of the invitee; the system resolves the `User` entity.

---

## 5\. API Endpoints

### 5.1 User Management — `/api/users`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `POST` | `/login` | Public | `UserLoginRequest` | `UserDto` (with `accessToken`) | ✅ Done |
| `POST` | `/register` | Public | `UserRegisterRequest` | `UserDto` | ✅ Done |
| `GET` | `/me` | Bearer | `Authorization` header | `UserDto` | ✅ Done |
| `GET` | `/{id}` | Bearer | — | `UserDto` | ✅ Done |
| `PUT` | `/{id}` | Bearer | `UserUpdateRequest` | `UserDto` | ⚠️ Stub |
| `POST` | `/forgot-password` | Public | `?email=` | `204 No Content` | ⚠️ Stub |
| `POST` | `/reset-password` | Public | `ResetPasswordRequest` | `204 No Content` | ⚠️ Stub |
| `DELETE` | `/{id}` | Bearer | — | `204 No Content` | ❌ Missing |

**`UserLoginRequest`** (record):

email: String

password: String

**`UserRegisterRequest`** (record, validated):

firstName: @NotEmpty String

lastName:  @NotEmpty String

email:     @Email String

password:  @Size(min=8) String

**`UserUpdateRequest`** (record, validated):

firstName: @NotEmpty String

lastName:  @NotEmpty String

**`ResetPasswordRequest`** (record, validated):

token:      @NotEmpty String

newPassword: @NotEmpty String

secretKey:  @NotEmpty String

---

### 5.2 User Trip Preferences — `/api/users/preferences`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/` | Bearer | — | `UserTripPreferenceDto` | ❌ Missing |
| `POST` | `/` | Bearer | `UserTripPreferenceRequest` | `UserTripPreferenceDto` | ❌ Missing |
| `PUT` | `/` | Bearer | `UserTripPreferenceRequest` | `UserTripPreferenceDto` | ❌ Missing |

**`UserTripPreferenceRequest`** (new record to create):

name:                 String (nullable)

interests:            List\<String\>

hobbies:              List\<String\>

favouriteDestinations: List\<String\>

---

### 5.3 Trip Plans — `/api/trips`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/` | Bearer | — | `List<TripPlanDto>` | ✅ Done |
| `GET` | `/{id}` | Bearer | — | `TripPlanDto` | ✅ Done |
| `POST` | `/` | Bearer | `TripPlanRequest` | `TripPlanDto` | ❌ Missing |
| `PUT` | `/{id}` | Bearer | `TripPlanRequest` | `TripPlanDto` | ❌ Missing |
| `PATCH` | `/{id}/status` | Bearer | `?status=PLANNED` | `TripPlanDto` | ❌ Missing |
| `DELETE` | `/{id}` | Bearer | — | `204 No Content` | ❌ Missing |

**`TripPlanRequest`** (new record to create):

name:      String

startDate: LocalDate (nullable — derived from first segment if omitted)

endDate:   LocalDate (nullable — derived from last segment if omitted)

interests: List\<String\>

---

### 5.4 Trip Segments — `/api/trips/{tripId}/segments`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/` | Bearer | — | `List<TripSegmentDto>` | ❌ Missing |
| `GET` | `/{segmentId}` | Bearer | — | `TripSegmentDto` | ❌ Missing |
| `POST` | `/` | Bearer | `TripSegmentRequest` | `TripSegmentDto` | ❌ Missing |
| `PUT` | `/{segmentId}` | Bearer | `TripSegmentRequest` | `TripSegmentDto` | ❌ Missing |
| `DELETE` | `/{segmentId}` | Bearer | — | `204 No Content` | ❌ Missing |
| `PATCH` | `/reorder` | Bearer | `List<SegmentOrderItem>` | `List<TripSegmentDto>` | ❌ Missing |

**`TripSegmentRequest`** (new record to create):

departure:            String

destination:          String

arrivalDate:          LocalDate

departureDate:        LocalDate

destinationLatitude:  Double (nullable)

destinationLongitude: Double (nullable)

**`SegmentOrderItem`** (new record to create):

segmentId:  UUID

orderIndex: Integer

---

### 5.5 Transport — `/api/trips/{tripId}/segments/{segmentId}/transport`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/` | Bearer | — | `TransportDto` | ❌ Missing |
| `POST` | `/` | Bearer | `TransportRequest` | `TransportDto` | ❌ Missing |
| `PUT` | `/` | Bearer | `TransportRequest` | `TransportDto` | ❌ Missing |
| `DELETE` | `/` | Bearer | — | `204 No Content` | ❌ Missing |

**`TransportRequest`** (new record to create):

transportType:      TransportType   // AIRPLANE | VEHICLE | TRAIN

airplaneTransport:  AirplaneTransportRequest (nullable)

vehicleTransport:   VehicleTransportRequest  (nullable)

**`AirplaneTransportRequest`**:

flightNumber:   String

departureTime:  LocalDateTime

arrivalTime:    LocalDateTime

duration:       String

price:          Double

currency:       String

**`VehicleTransportRequest`**:

distanceKm:          Double

estimatedFuelCost:   Double

tollCost:            Double

#### Flight Search — `/api/flights/search`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/search` | Bearer | Query params (see below) | `List<FlightOfferDto>` | ❌ Missing |

Query params: `origin`, `destination`, `departureDate`, `adults` (Integer)

`FlightOfferDto` is a transient DTO (not persisted) mapping Amadeus API results:

flightNumber:  String

carrier:       String

departureTime: LocalDateTime

arrivalTime:   LocalDateTime

duration:      String

price:         Double

currency:      String

stops:         Integer

bookingUrl:    String (deeplink, optional)

#### Vehicle Route — `/api/routes/calculate`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `POST` | `/calculate` | Bearer | `RouteCalculationRequest` | `VehicleTransportDto` | ❌ Missing |

originCity:       String

destinationCity:  String

---

### 5.6 Accommodation — `/api/trips/{tripId}/segments/{segmentId}/accommodation`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/` | Bearer | — | `AccommodationDto` | ❌ Missing |
| `POST` | `/` | Bearer | `AccommodationRequest` | `AccommodationDto` | ❌ Missing |
| `PUT` | `/` | Bearer | `AccommodationRequest` | `AccommodationDto` | ❌ Missing |
| `DELETE` | `/` | Bearer | — | `204 No Content` | ❌ Missing |

#### Accommodation Search — `/api/accommodation/search`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/search` | Bearer | Query params (see below) | `List<AccommodationOfferDto>` | ❌ Missing |

Query params: `cityName`, `checkIn` (LocalDate), `checkOut` (LocalDate), `adults` (Integer)

`AccommodationOfferDto` (transient, not persisted):

name:        String

address:     String

imageUrl:    String

bookingUrl:  String

starRating:  Double

reviewScore: Double

priceTotal:  Double

currency:    String

**`AccommodationRequest`** (new record to create):

name:        String

address:     String

imageUrl:    String  (nullable)

bookingUrl:  String  (nullable)

starRating:  Double  (nullable)

reviewScore: Double  (nullable)

checkIn:     LocalDate

checkOut:    LocalDate

priceTotal:  Double  (nullable)

currency:    String  (nullable)

---

### 5.7 Daily Itineraries — `/api/trips/{tripId}/segments/{segmentId}/itineraries`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/` | Bearer | — | `List<DailyItineraryDto>` | ❌ Missing |
| `GET` | `/{itineraryId}` | Bearer | — | `DailyItineraryDto` | ❌ Missing |
| `POST` | `/` | Bearer | `DailyItineraryRequest` | `DailyItineraryDto` | ❌ Missing |
| `PUT` | `/{itineraryId}` | Bearer | `DailyItineraryRequest` | `DailyItineraryDto` | ❌ Missing |
| `DELETE` | `/{itineraryId}` | Bearer | — | `204 No Content` | ❌ Missing |

#### AI-Generated Activity Suggestions — `/api/trips/{tripId}/segments/{segmentId}/itineraries/suggest`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `GET` | `/suggest` | Bearer | `?categories=MUSEUM,PARK` | `List<DailyItineraryDto>` | ❌ Missing |

**`DailyItineraryRequest`** (new record to create):

name:            String

category:        String

categoryIconUrl: String  (nullable)

address:         String  (nullable)

latitude:        Double  (nullable)

longitude:       Double  (nullable)

day:             LocalDate

startTime:       LocalTime

endTime:         LocalTime

---

### 5.8 AI Assistant — `/api/trips/{tripId}/ai`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `POST` | `/chat` | Bearer | `AIMessageRequest` | `AIMessageResponse` | ❌ Missing |
| `GET` | `/history` | Bearer | — | `List<AIInteractionDto>` | ❌ Missing |

**`AIMessageRequest`** (new record to create):

message: String

**`AIMessageResponse`** (new record to create):

reply:     String

timestamp: ZonedDateTime

**`AIInteractionDto`** (new record to create):

base:       BaseEntityDto

message:    String

senderType: SenderType   // USER | AI

timestamp:  ZonedDateTime

---

### 5.9 Plan Sharing — `/api/trips/{tripId}/share`

| Method | Path | Auth | Request | Response | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `POST` | `/` | Bearer | `PlanShareRequest` | `PlanShareDto` | ❌ Missing |
| `GET` | `/` | Bearer | — | `List<PlanShareDto>` | ❌ Missing |
| `DELETE` | `/{shareId}` | Bearer | — | `204 No Content` | ❌ Missing |
| `GET` | `/shared-with-me` | Bearer | — | `List<TripPlanDto>` | ❌ Missing |

**`PlanShareRequest`** (new record to create):

email:      String   // email of the user to invite

accessType: AccessType  // READ\_ONLY | EDITOR

**`PlanShareDto`** (new record to create):

base:           BaseEntityDto

sharedWithUser: UserDto

accessType:     AccessType

inviteSentAt:   ZonedDateTime

---

## 6\. Feature Specifications

### 6.1 User Registration & Login

**Registration flow:**

1. Client `POST /api/users/register` with `UserRegisterRequest`.  
2. Backend validates fields (Bean Validation).  
3. Email uniqueness check — throws `BadRequestException` if duplicate.  
4. Password encoded with BCrypt.  
5. `role` forced to `REGULAR_USER`.  
6. Saved and returned as `UserDto` (no `accessToken` — user must log in).

**Login flow:**

1. Client `POST /api/users/login` with email \+ password.  
2. `AuthService.login` fetches user by email (case-insensitive).  
3. Checks `deleted` flag.  
4. Verifies BCrypt hash.  
5. Returns `UserDto` with `accessToken` (JWT, 30-day expiry).

**Forgot / Reset Password flow** *(to be implemented)*:

1. Client `POST /api/users/forgot-password?email=<email>`.  
2. System generates a short-lived signed token and sends it to the user's email.  
3. Client `POST /api/users/reset-password` with `{ token, newPassword, secretKey }`.  
4. System validates token, encodes new password, persists.

---

### 6.2 User Profile Management

- `PUT /api/users/{id}` — update `firstName` / `lastName` only.  
- `DELETE /api/users/{id}` — soft-delete (`deleted = true`); only the user themselves or a `SYSTEM_ADMIN`/`SUPER_ADMIN` may call this.  
- User cannot change their own `email` or `role` through the API (admin-only operation).

---

### 6.3 Travel Preferences (Survey)

- The travel survey (`UserTripPreference`) is a global profile attached to the user.  
- During trip creation, the frontend prompts the user to fill in the survey, or re-use and optionally update the existing one.  
- `interests`, `hobbies`, `favouriteDestinations` are free-text strings (comma-separated; no fixed enum on the backend).  
- The preferences are forwarded to the AI assistant as context for generating activity suggestions.

---

### 6.4 Trip Plan Lifecycle

**Create:**

1. `POST /api/trips` with `TripPlanRequest` (name \+ optional dates \+ interests).  
2. Status defaults to `DRAFT`.  
3. `user` set to `AuthUtils.getLoggedUser()`.  
4. Segments are added separately via the segments API.

**Update:**

- `PUT /api/trips/{id}` updates name, interests, dates.  
- Ownership is verified.

**Status transition:**

- `PATCH /api/trips/{id}/status?status=PLANNED` — validated against allowed transitions.  
- Allowed: `DRAFT → PLANNED`, `PLANNED → BOOKED`, `BOOKED → COMPLETED`.

**Delete:**

- `DELETE /api/trips/{id}` — hard delete; cascades to all segments, transport, accommodation, itineraries, AI interactions, and shares.

---

### 6.5 Trip Segment Management

- Segments are ordered by `orderIndex` (ascending).  
- When a segment is created, it is appended at the end (`orderIndex = current count`).  
- **Date continuity validation** is enforced on create and update:  
  - `arrivalDate < departureDate` within the same segment.  
  - `segment[N].departureDate == segment[N+1].arrivalDate`.  
- Reorder endpoint (`PATCH /api/trips/{tripId}/segments/reorder`) accepts a list of `{segmentId, orderIndex}` pairs and re-assigns all indices atomically.

---

### 6.6 Transport Selection

**Airplane:**

1. User searches flights via `GET /api/flights/search?origin=BEG&destination=FCO&departureDate=2026-06-01&adults=2`.  
2. Backend proxies the Amadeus (or compatible) API and returns `List<FlightOfferDto>` (not persisted).  
3. User selects a flight → `POST /api/trips/{id}/segments/{sid}/transport` with `TransportRequest` of type `AIRPLANE`.  
4. `AirplaneTransport` is saved; late-night check runs; accommodation check-in is adjusted if needed.

**Vehicle:**

1. User selects "own vehicle" → client calls `POST /api/routes/calculate` with origin/destination.  
2. Backend calls routing API, calculates distance, fuel cost, toll cost.  
3. Returns pre-filled `VehicleTransportDto` for the user to review.  
4. User confirms → `POST /api/trips/{id}/segments/{sid}/transport` with `TransportRequest` of type `VEHICLE`.

**Train** — `TransportType.TRAIN` is reserved; no integration implemented yet.

---

### 6.7 Accommodation

1. User searches via `GET /api/accommodation/search?cityName=Rome&checkIn=2026-06-02&checkOut=2026-06-05&adults=2`.  
2. Backend proxies Booking.com / RapidAPI Hotels and returns `List<AccommodationOfferDto>`.  
3. User selects an offer → `POST /api/trips/{id}/segments/{sid}/accommodation` with `AccommodationRequest`.  
4. If the user wants to add custom accommodation (e.g., staying with friends), they omit `bookingUrl`/`starRating`/`reviewScore`.  
5. `checkIn` / `checkOut` auto-populated from segment dates; can be overridden.

---

### 6.8 Daily Itinerary & Activities

1. AI suggestion endpoint (`GET /suggest?categories=MUSEUM,PARK`) returns a ranked list of activities for the segment's destination.  
2. The AI uses `TripPlan.interests` and `UserTripPreference` to filter and rank.  
3. Opening-hours data sourced from Google Places API; activities outside operating hours are excluded.  
4. User selects and saves activities via `POST` to the itinerary endpoint.  
5. Time-slot overlap check runs on each create/update.  
6. `day` must fall within `[segment.arrivalDate, segment.departureDate)`.

---

### 6.9 AI Assistant

**Context window sent to LLM on every message:**

\- User name and preferences (interests, hobbies, favourite destinations)

\- TripPlan: name, dates, destinations, status

\- All TripSegments with dates, transport type, accommodation name

\- All DailyItineraries for the current and upcoming segments

\- Full message history for this plan (AIInteraction records)

**Capabilities:**

- Answer questions about the plan (e.g., "When do I arrive in Rome?").  
- Recommend restaurants, sights, or activities based on current segment location and user preferences.  
- Provide educational / historical information about places.  
- Detect and warn about schedule conflicts.  
- Suggest a logical ordering of destinations (when building the plan).

**Guest behaviour (frontend-only):** AI requests are not persisted; no conversation history; context is sent inline with each message.

---

### 6.10 Plan Sharing

1. Owner calls `POST /api/trips/{tripId}/share` with the invitee's email and `accessType`.  
2. Backend resolves the `User` by email.  
3. `PlanShare` record is created with `inviteSentAt = now()`.  
4. Invitee can see all plans shared with them via `GET /api/trips/shared-with-me`.  
5. Shared plans are read-only (`READ_ONLY`); the invitee cannot modify segments, transport, accommodation, or itineraries.  
6. Owner can revoke sharing via `DELETE /api/trips/{tripId}/share/{shareId}`.

---

### 6.11 Additional Features *(Future)*

| Feature | Description |
| :---- | :---- |
| **Weather Forecast** | 7 days before `TripSegment.arrivalDate`, push a weather notification for the destination. Integrate with OpenWeatherMap or similar API. Use the scheduler (ShedLock) to run daily. |
| **Timezone Display** | When displaying `AirplaneTransport.departureTime` / `arrivalTime`, convert to the local timezone of the departure/destination airport using the IANA tz database. |
| **PDF Export** | Generate a PDF of the full trip plan (all segments, transport, accommodation, itineraries, and map links) for offline use. Use Apache PDFBox or iText. Exposed as `GET /api/trips/{id}/export/pdf`. |
| **Drag & Drop Reorder** | Handled by the `/reorder` patch endpoint; frontend sends the new order. |
| **Editor Sharing** | `AccessType.EDITOR` allows the invitee to add/edit segments and itineraries. |

---

## 7\. DTOs to Create

The following Java records must be created in `domain/dto/` following the existing conventions:

| DTO | Package |
| :---- | :---- |
| `TripSegmentDto` | `domain/dto/trip/` |
| `TransportDto` | `domain/dto/trip/` |
| `AirplaneTransportDto` | `domain/dto/trip/` |
| `VehicleTransportDto` | `domain/dto/trip/` |
| `AccommodationDto` | `domain/dto/accomodation/` |
| `DailyItineraryDto` | `domain/dto/trip/` |
| `AIInteractionDto` | `domain/dto/ai/` |
| `PlanShareDto` | `domain/dto/trip/` |
| `UserTripPreferenceDto` | `domain/dto/user/` |
| `FlightOfferDto` | `domain/dto/trip/` |
| `AccommodationOfferDto` | `domain/dto/accomodation/` |
| `TripPlanRequest` | `domain/dto/trip/` |
| `TripSegmentRequest` | `domain/dto/trip/` |
| `TransportRequest` | `domain/dto/trip/` |
| `AirplaneTransportRequest` | `domain/dto/trip/` |
| `VehicleTransportRequest` | `domain/dto/trip/` |
| `AccommodationRequest` | `domain/dto/accomodation/` |
| `DailyItineraryRequest` | `domain/dto/trip/` |
| `AIMessageRequest` | `domain/dto/ai/` |
| `AIMessageResponse` | `domain/dto/ai/` |
| `PlanShareRequest` | `domain/dto/trip/` |
| `UserTripPreferenceRequest` | `domain/dto/user/` |
| `SegmentOrderItem` | `domain/dto/trip/` |
| `RouteCalculationRequest` | `domain/dto/trip/` |

Every DTO record must follow this structure:

public record XxxDto(

    BaseEntityDto base,   // always first for persisted entities

    // ... domain fields

) {

    public UUID id() { return base \!= null ? base.id() : null; }

}

Transient offer DTOs (not persisted entities) do **not** include `BaseEntityDto base`.

---

## 8\. Mappers to Create

All mappers live in `domain/mappers/` and implement the `toBase(Entity)` default method pattern.

| Mapper | Maps |
| :---- | :---- |
| `TripSegmentMapper` | `TripSegment ↔ TripSegmentDto` |
| `TransportMapper` | `Transport ↔ TransportDto` |
| `AccommodationMapper` | `Accommodation ↔ AccommodationDto` |
| `DailyItineraryMapper` | `DailyItinerary ↔ DailyItineraryDto` |
| `AIInteractionMapper` | `AIInteraction ↔ AIInteractionDto` |
| `PlanShareMapper` | `PlanShare ↔ PlanShareDto` |
| `UserTripPreferenceMapper` | `UserTripPreference ↔ UserTripPreferenceDto` |

All mappers must declare:

@Mapper(

    unmappedTargetPolicy \= ReportingPolicy.IGNORE,

    nullValuePropertyMappingStrategy \= NullValuePropertyMappingStrategy.IGNORE

)

---

## 9\. Services to Create / Extend

| Service | Package | Notes |
| :---- | :---- | :---- |
| `UserService` | `services/ums/` | Add: `update`, `softDelete` methods |
| `UserTripPreferenceService` | `services/ums/` | New: `get`, `createOrUpdate` |
| `TripPlanService` | `services/trip/` | Add: `create`, `update`, `updateStatus`, `delete` |
| `TripSegmentService` | `services/trip/` | New: full CRUD \+ reorder |
| `TransportService` | `services/trip/` | New: full CRUD; late-night logic |
| `AccommodationService` | `services/trip/` | New: full CRUD |
| `DailyItineraryService` | `services/trip/` | New: full CRUD \+ overlap validation |
| `AIService` | `services/ai/` | New: chat, history retrieval, context builder |
| `PlanShareService` | `services/trip/` | New: share, list, revoke, shared-with-me |
| `FlightSearchService` | `services/trip/` | New: proxy flight search API |
| `RouteCalculationService` | `services/trip/` | New: proxy routing API |
| `AccommodationSearchService` | `services/trip/` | New: proxy accommodation search API |

All services must be annotated `@Transactional(readOnly = true)` at class level with `@Transactional` overrides on write methods.

---

## 10\. Controllers to Create

All controllers live in `web/controllers/user/` and map under `/api/`.

| Controller | Base path |
| :---- | :---- |
| `UserController` *(extend)* | `/api/users` |
| `UserTripPreferenceController` | `/api/users/preferences` |
| `TripPlanController` *(extend)* | `/api/trips` |
| `TripSegmentController` | `/api/trips/{tripId}/segments` |
| `TransportController` | `/api/trips/{tripId}/segments/{segmentId}/transport` |
| `AccommodationController` | `/api/trips/{tripId}/segments/{segmentId}/accommodation` |
| `DailyItineraryController` | `/api/trips/{tripId}/segments/{segmentId}/itineraries` |
| `AIController` | `/api/trips/{tripId}/ai` |
| `PlanShareController` | `/api/trips/{tripId}/share` |
| `FlightSearchController` | `/api/flights` |
| `RouteCalculationController` | `/api/routes` |
| `AccommodationSearchController` | `/api/accommodation` |

---

## 11\. Implementation Checklist

### Phase 1 — Core CRUD (Backend completeness)

- [ ] `TripPlanService`: `create`, `update`, `updateStatus`, `delete`  
- [ ] `TripPlanController`: `POST /`, `PUT /{id}`, `PATCH /{id}/status`, `DELETE /{id}`  
- [ ] `TripSegmentService` \+ `TripSegmentController`: full CRUD \+ reorder  
- [ ] `TransportService` \+ `TransportController`: full CRUD  
- [ ] `AccommodationService` \+ `AccommodationController`: full CRUD  
- [ ] `DailyItineraryService` \+ `DailyItineraryController`: full CRUD  
- [ ] All DTOs listed in Section 7  
- [ ] All Mappers listed in Section 8  
- [ ] `UserService.update` \+ `UserService.softDelete`  
- [ ] `UserTripPreferenceService` \+ `UserTripPreferenceController`

### Phase 2 — Auth Completion

- [ ] Forgot password email flow  
- [ ] Reset password token validation  
- [ ] `UserController.update` implementation

### Phase 3 — External Integrations

- [ ] Flight search API proxy (`FlightSearchService`)  
- [ ] Vehicle routing API proxy (`RouteCalculationService`)  
- [ ] Accommodation search API proxy (`AccommodationSearchService`)

### Phase 4 — AI & Sharing

- [ ] `AIInteraction` entity \+ repository \+ mapper  
- [ ] `AIService` with LLM integration (OpenAI GPT-4o or similar)  
- [ ] `AIController`  
- [ ] `PlanShare` entity \+ repository \+ mapper  
- [ ] `PlanShareService` \+ `PlanShareController`

### Phase 5 — Advanced Features

- [ ] Scheduled weather forecast notifications (ShedLock)  
- [ ] PDF export endpoint  
- [ ] Timezone-aware datetime display  
- [ ] Editor sharing permissions

