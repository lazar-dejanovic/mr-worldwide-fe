import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useApp, AIMessage } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatOverlayProps {
  tripId: string;
  onClose: () => void;
}

function ChatBubble({ msg }: { msg: AIMessage }) {
  const isUser = msg.senderType === 'USER';
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-auto"
          style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', boxShadow: '0 2px 8px rgba(0,122,255,0.4)' }}>
          <Sparkles size={14} color="#fff" />
        </div>
      )}
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'linear-gradient(135deg, #007AFF, #0057E7)' : '#F2F2F7',
          color: isUser ? '#fff' : '#000',
          fontSize: '15px',
          lineHeight: '1.5',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg.message}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div className="flex justify-start mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
        style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}>
        <Sparkles size={14} color="#fff" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-[#F2F2F7] flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-gray-400"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

const QUICK_PROMPTS = [
  'Reschedule my day',
  'Find a restaurant nearby',
  'Check opening hours',
  'Suggest alternatives',
];

export function AIChatOverlay({ tripId, onClose }: AIChatOverlayProps) {
  const { aiMessages, sendAIMessage } = useApp();
  const messages = aiMessages[tripId] || [];
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;
    setInput('');
    setIsTyping(true);
    sendAIMessage(tripId, message);
    setTimeout(() => setIsTyping(false), 1400);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-50 flex flex-col"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex-1" onClick={onClose} />

        <motion.div
          className="bg-white rounded-t-3xl flex flex-col"
          style={{ height: '75%' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', boxShadow: '0 4px 12px rgba(0,122,255,0.4)' }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>MR AI Assistant</p>
                <p style={{ fontSize: '12px', color: '#34C759', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>● Online</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <X size={16} color="#8E8E93" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #007AFF20, #5856D620)' }}>
                  <Sparkles size={28} color="#007AFF" />
                </div>
                <p style={{ fontSize: '17px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>How can I help?</p>
                <p style={{ fontSize: '14px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', maxWidth: '220px' }}>
                  Ask me to reschedule activities, find restaurants, or optimize your itinerary.
                </p>
              </div>
            )}
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Quick prompts */}
          {messages.length === 0 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="flex-shrink-0 px-3 py-2 rounded-full text-sm border border-gray-200 bg-white"
                  style={{ fontSize: '13px', color: '#007AFF', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', whiteSpace: 'nowrap' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-3">
            <div className="flex-1 px-4 py-3 rounded-2xl" style={{ background: '#F2F2F7', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Message your AI assistant..."
                className="w-full bg-transparent outline-none"
                style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #007AFF, #0057E7)' : '#E5E5EA',
                transition: 'all 0.2s',
              }}
            >
              <Send size={16} color={input.trim() ? '#fff' : '#8E8E93'} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
