import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import AuthScreen from './screens/AuthScreen';
import SurveyScreen from './screens/SurveyScreen';
import DashboardScreen from './screens/DashboardScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import TransportScreen from './screens/TransportScreen';
import AccommodationScreen from './screens/AccommodationScreen';
import ItineraryScreen from './screens/ItineraryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ExplorePlaceholder from './screens/ExplorePlaceholder';
import ChatScreen from './screens/ChatScreen';

function NotFound() {
  return <Navigate to="/" replace />;
}

// Root wraps everything in AppProvider so context is always in the React Router tree
function Root() {
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
}

export const router = createBrowserRouter([
  {
    Component: Root,
    children: [
      {
        path: '/auth',
        Component: AuthScreen,
      },
      {
        path: '/survey',
        Component: SurveyScreen,
      },
      {
        // Pathless layout route — acts as auth guard for all app routes
        Component: AuthGuard,
        children: [
          {
            path: '/',
            Component: Layout,
            children: [
              { index: true, Component: DashboardScreen },
              { path: 'trips/:id', Component: TripDetailScreen },
              { path: 'trips/:id/segments/:segmentId/transport', Component: TransportScreen },
              { path: 'trips/:id/segments/:segmentId/accommodation', Component: AccommodationScreen },
              { path: 'trips/:id/segments/:segmentId/itinerary', Component: ItineraryScreen },
              { path: 'profile', Component: ProfileScreen },
              { path: 'explore', Component: ExplorePlaceholder },
              { path: 'chat', Component: ChatScreen },
              { path: '*', Component: NotFound },
            ],
          },
        ],
      },
    ],
  },
]);