import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Loader, CheckCircle, Sparkles, Brain, Shield, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { signup, createSession, getPasswordStrength } from '../utils/authService';

interface SignupPageProps {
  onNavigate: (page: string) => void;
  onSignup: (name?: string) => void;
}

// ── 3D Abstract Illustration Canvas ────────────────────────────────────────
function SecureNodesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    interface Hex { x: number; y: number; size: number; phase: number; speed: number; }
    const hexes: Hex[] = [];
    for (let i = 0; i < 20; i++) {
      hexes.push({
        x: Math.random() * 600,
        y: Math.random() * 900,
        size: 15 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.015,
      });
    }

    let tick = 0;
    const draw = () => {
      tick++;
      const W = w();
      const H = h();
      ctx.clearRect(0, 0, W, H);

      hexes.forEach((hex) => {
        hex.phase += hex.speed;
        const alpha = (Math.sin(hex.phase) * 0.5 + 0.5) * 0.12;
        ctx.strokeStyle = `rgba(0,243,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI / 3) * j - Math.PI / 6;
          const px = hex.x + hex.size * Math.cos(angle);
          const py = hex.y + hex.size * Math.sin(angle);
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      });

      animFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export function SignupPage({ onNavigate, onSignup }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(password);
  const strengthColors = ['#ef4444', '#f59e0b', '#10b981', '#00d9ff'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const result = signup({ name, email, password });
      
      if (!result.success) {
        setError(result.error || 'Signup failed');
        setIsLoading(false);
        return;
      }

      // Create session and auto-login
      if (result.user) {
        createSession(result.user, false);
        onSignup(result.user.name);
      }
      setIsLoading(false);
    }, 1800);
  };

  const inputStyle = {
    background: 'rgba(10, 14, 39, 0.6)',
    border: '1px solid rgba(0, 217, 255, 0.25)',
    color: 'var(--cyber-white)',
  };

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row" style={{ background: '#0A0F1E' }}>
      {/* ── LEFT: 3D Illustration Panel ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0A0F1E 0%, #0d7377 60%, #080d1a 100%)',
        }}
      >
        <SecureNodesCanvas />

        <div className="relative z-10 text-center px-12 max-w-lg">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-3xl p-8 mb-8"
            style={{
              background: 'rgba(10,15,30,0.65)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,243,255,0.2)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,243,255,0.08)',
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(0,243,255,0.2), rgba(13,115,119,0.3))',
                border: '1px solid rgba(0,243,255,0.3)',
                boxShadow: '0 0 30px rgba(0,243,255,0.2)',
              }}
            >
              <Shield size={36} style={{ color: '#00F3FF' }} />
            </div>
            <h3 style={{ color: '#E8F4F8', fontSize: '1.2rem', fontWeight: 700 }}>
              Secure Data Nodes
            </h3>
            <p className="text-sm mt-2 mb-5" style={{ color: '#E8F4F8', opacity: 0.55 }}>
              Your documents are processed locally. No data leaves your browser.
            </p>

            <div className="space-y-2">
              {[
                { icon: Brain, label: 'Smart Document Q&A' },
                { icon: Zap, label: 'Instant Page Citations' },
                { icon: Sparkles, label: 'Source-Grounded Answers' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(0,243,255,0.04)', border: '1px solid rgba(0,243,255,0.12)' }}
                >
                  <f.icon size={15} style={{ color: '#00F3FF' }} />
                  <span className="text-sm" style={{ color: '#E8F4F8', opacity: 0.75 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(0,243,255,0.06)',
              border: '1px solid rgba(0,243,255,0.25)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sparkles size={12} style={{ color: '#00F3FF' }} />
            <span className="text-xs tracking-wider" style={{ color: '#00F3FF' }}>
              Powered by Hack The Spring '26
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── RIGHT: Signup Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,243,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-8">
            <Logo size="md" />
          </div>

          <h2 className="mb-1" style={{ color: '#E8F4F8', fontSize: '1.6rem', fontWeight: 700 }}>
            Create Account
          </h2>
          <p className="text-sm mb-6" style={{ color: '#E8F4F8', opacity: 0.5 }}>
            Join HACK HUNTERS and unlock document intelligence
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#E8F4F8', opacity: 0.8 }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: '#00F3FF', opacity: 0.5 }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full rounded-xl pl-12 pr-4 py-3 outline-none text-sm" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#E8F4F8', opacity: 0.8 }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: '#00F3FF', opacity: 0.5 }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full rounded-xl pl-12 pr-4 py-3 outline-none text-sm" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#E8F4F8', opacity: 0.8 }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: '#00F3FF', opacity: 0.5 }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" className="w-full rounded-xl pl-12 pr-12 py-3 outline-none text-sm" style={inputStyle} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#00F3FF', opacity: 0.5 }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {password && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((l) => (
                      <div key={l} className="h-1 flex-1 rounded-full" style={{ background: strength >= l ? strengthColors[strength - 1] : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColors[strength - 1] || 'rgba(255,255,255,0.4)' }}>{strength > 0 ? strengthLabels[strength - 1] : ''}</span>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#E8F4F8', opacity: 0.8 }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: '#00F3FF', opacity: 0.5 }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full rounded-xl pl-12 pr-12 py-3 outline-none text-sm"
                  style={{
                    ...inputStyle,
                    border: confirmPassword && password !== confirmPassword
                      ? '1px solid rgba(239,68,68,0.5)'
                      : confirmPassword && password === confirmPassword
                      ? '1px solid rgba(16,185,129,0.5)'
                      : inputStyle.border,
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {confirmPassword && password === confirmPassword ? (
                    <CheckCircle size={17} style={{ color: '#10b981' }} />
                  ) : (
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ color: '#00F3FF', opacity: 0.5 }}>
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 35px rgba(0,243,255,0.5)' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 mt-1"
              style={{
                background: isLoading ? 'rgba(0,217,255,0.3)' : 'linear-gradient(135deg, #0d7377, #00F3FF)',
                color: '#0A0F1E',
                boxShadow: isLoading ? 'none' : '0 0 25px rgba(0,243,255,0.4)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <><Loader size={18} className="animate-spin" /><span className="font-semibold">Creating Account...</span></>
              ) : (
                <><span className="font-semibold">Create Account</span><ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-5 text-center">
            <span className="text-sm" style={{ color: '#E8F4F8', opacity: 0.5 }}>Already have an account? </span>
            <button onClick={() => onNavigate('login')} className="text-sm hover:underline" style={{ color: '#00F3FF' }}>Sign In</button>
          </div>
          <div className="mt-3 text-center">
            <button onClick={() => onNavigate('welcome')} className="text-sm hover:underline" style={{ color: '#E8F4F8', opacity: 0.35 }}>&larr; Back to Home</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}