import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Globe, ArrowRight, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1576737064520-f45d313d17ff?w=1080&q=80';

export default function AuthScreen() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleLogin = () => {
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    const ok = login(form.email, form.password);
    if (ok) {
      navigate('/');
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleRegister = () => {
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const ok = register(form.firstName, form.lastName, form.email, form.password);
    if (ok) navigate('/survey');
  };

  const handleSubmit = () => mode === 'login' ? handleLogin() : handleRegister();

  const handleDemoLogin = () => {
    login('alex@example.com', 'password');
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0D0D1A' }}>
      {/* Hero Section */}
      <div className="relative flex-shrink-0" style={{ height: '42%' }}>
        <img src={HERO_IMAGE} alt="Travel" className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,13,26,0.3) 0%, rgba(13,13,26,0.85) 100%)' }} />

        {/* Logo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)', boxShadow: '0 8px 24px rgba(0,87,231,0.5)' }}>
              <Globe size={28} color="#fff" strokeWidth={1.5} />
            </div>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-1px' }}>
            MR Worldwide
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginTop: '4px' }}>
            AI-Powered Trip Planning
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 flex flex-col rounded-t-3xl overflow-y-auto"
        style={{ background: '#fff', marginTop: '-24px', boxShadow: '0 -8px 32px rgba(0,0,0,0.2)' }}>
        <div className="px-6 pt-8 pb-6 flex flex-col flex-1">
          {/* Mode Toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: '#F2F2F7' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#000' : '#8E8E93',
                  fontWeight: mode === m ? 600 : 400,
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '15px',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  transition: 'all 0.2s',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3 flex-1">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="names"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                    <User size={16} color="#8E8E93" />
                    <input
                      type="text"
                      placeholder="First name"
                      value={form.firstName}
                      onChange={e => updateForm('firstName', e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                    <User size={16} color="#8E8E93" />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={e => updateForm('lastName', e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
              <Mail size={16} color="#8E8E93" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => updateForm('email', e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
              <Lock size={16} color="#8E8E93" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => updateForm('password', e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} color="#8E8E93" /> : <Eye size={16} color="#8E8E93" />}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '13px', color: '#FF3B30', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', textAlign: 'center' }}>
                {error}
              </motion.p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0057E7 100%)',
                color: '#fff',
                fontSize: '17px',
                fontWeight: 600,
                border: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                boxShadow: '0 4px 16px rgba(0,87,231,0.4)',
              }}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} />
            </button>

            {/* Demo Login */}
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
              style={{
                background: '#F2F2F7',
                color: '#007AFF',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              <CheckCircle size={16} />
              Guest
            </button>

            {mode === 'login' && (
              <button className="text-center" style={{ fontSize: '14px', color: '#007AFF', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Forgot Password?
              </button>
            )}
          </div>

          <p style={{ fontSize: '12px', color: '#C7C7CC', textAlign: 'center', marginTop: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}