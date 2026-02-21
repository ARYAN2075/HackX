import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader, Sparkles, Shield, FileText, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { login, createSession } from '../utils/authService';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (name?: string) => void;
}

// ── 3D Illustration Canvas ──────────────────────────────────────────────────
function DataNodesCanvas() {
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

    interface Node {
      x: number; y: number; vx: number; vy: number; r: number;
      color: string; pulse: number; pulseSpeed: number;
    }

    const nodes: Node[] = [];
    const colors = ['#00F3FF', '#38EFF0', '#0d7377', '#7c3aed', '#14a1a8'];

    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.random() * 600,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    let tick = 0;
    const draw = () => {
      tick++;
      const W = w();
      const H = h();
      ctx.clearRect(0, 0, W, H);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with glow
      nodes.forEach((n) => {
        const p = Math.sin(n.pulse) * 0.5 + 0.5;
        const rad = n.r + p * 1.5;

        // Outer glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rad * 4);
        grad.addColorStop(0, n.color + '30');
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(n.x, n.y, rad * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = n.color + (Math.round((0.5 + p * 0.5) * 255)).toString(16).padStart(2, '0');
        ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw floating document icons
      const docY = H * 0.3 + Math.sin(tick * 0.015) * 20;
      ctx.save();
      ctx.translate(W * 0.5, docY);
      ctx.strokeStyle = 'rgba(0,243,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-30, -40, 60, 80);
      ctx.strokeRect(-28, -30, 56, 5);
      ctx.strokeRect(-28, -20, 40, 3);
      ctx.strokeRect(-28, -12, 48, 3);
      ctx.strokeRect(-28, -4, 36, 3);
      ctx.restore();

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

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    setIsLoading(true);
    setTimeout(() => {
      const result = login({ email, password, rememberMe });
      
      if (!result.success) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Create session
      if (result.user) {
        createSession(result.user, rememberMe);
        onLogin(result.user.name);
      }
      setIsLoading(false);
    }, 1500);
  };

  const inputStyle = {
    background: 'rgba(10, 14, 39, 0.6)',
    border: '1px solid rgba(0, 217, 255, 0.25)',
    color: 'var(--cyber-white)',
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#0A0F1E' }}>
      {/* ── LEFT: Authentication Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,243,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="mb-8">
            <Logo size="md" />
          </div>

          <h2 className="mb-1" style={{ color: '#E8F4F8', fontSize: '1.6rem', fontWeight: 700 }}>
            Welcome Back
          </h2>
          <p className="text-sm mb-8" style={{ color: '#E8F4F8', opacity: 0.5 }}>
            Sign in to access your document intelligence workspace
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#E8F4F8', opacity: 0.8 }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#00F3FF', opacity: 0.5 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl pl-12 pr-4 py-3.5 outline-none text-sm"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#E8F4F8', opacity: 0.8 }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#00F3FF', opacity: 0.5 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl pl-12 pr-12 py-3.5 outline-none text-sm"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#00F3FF', opacity: 0.5 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{
                    background: rememberMe ? 'var(--cyber-cyan)' : 'transparent',
                    border: `2px solid ${rememberMe ? 'var(--cyber-cyan)' : 'rgba(0,243,255,0.35)'}`,
                  }}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#0a0e27" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm" style={{ color: '#E8F4F8', opacity: 0.6 }}>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm hover:underline"
                style={{ color: '#00F3FF', opacity: 0.8 }}
              >
                Forgot Password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 35px rgba(0,243,255,0.5)' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: isLoading ? 'rgba(0,217,255,0.3)' : 'linear-gradient(135deg, #0d7377, #00F3FF)',
                color: '#0A0F1E',
                boxShadow: isLoading ? 'none' : '0 0 25px rgba(0,243,255,0.4)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {!isLoading && (
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                />
              )}
              {isLoading ? (
                <><Loader size={18} className="animate-spin" /><span className="font-semibold">Signing in...</span></>
              ) : (
                <><span className="font-semibold relative z-10">Sign In</span><ArrowRight size={18} className="relative z-10" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm" style={{ color: '#E8F4F8', opacity: 0.5 }}>Don't have an account? </span>
            <button onClick={() => onNavigate('signup')} className="text-sm hover:underline" style={{ color: '#00F3FF' }}>
              Sign Up
            </button>
          </div>

          <div className="mt-4 text-center">
            <button onClick={() => onNavigate('welcome')} className="text-sm hover:underline" style={{ color: '#E8F4F8', opacity: 0.35 }}>
              &larr; Back to Home
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT: 3D Illustration Panel ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #080d1a 0%, #0d7377 50%, #0A0F1E 100%)',
        }}
      >
        {/* Canvas background */}
        <DataNodesCanvas />

        {/* Central content overlay */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* 3D floating card */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-3xl p-8 mb-8 relative"
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
                background: 'linear-gradient(135deg, rgba(0,243,255,0.2), rgba(124,58,237,0.15))',
                border: '1px solid rgba(0,243,255,0.3)',
                boxShadow: '0 0 30px rgba(0,243,255,0.2)',
              }}
            >
              <FileText size={36} style={{ color: '#00F3FF' }} />
            </div>
            <h3 style={{ color: '#E8F4F8', fontSize: '1.2rem', fontWeight: 700 }}>
              Document Intelligence
            </h3>
            <p className="text-sm mt-2 mb-5" style={{ color: '#E8F4F8', opacity: 0.55 }}>
              Upload policies, academic rules & guidelines. Get source-grounded answers instantly.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Secure' },
                { icon: Zap, label: 'Fast' },
                { icon: Sparkles, label: 'Smart' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl py-2.5 px-2 text-center"
                  style={{
                    background: 'rgba(0,243,255,0.06)',
                    border: '1px solid rgba(0,243,255,0.15)',
                  }}
                >
                  <f.icon size={16} className="mx-auto mb-1" style={{ color: '#00F3FF' }} />
                  <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.7 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badge */}
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

      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}