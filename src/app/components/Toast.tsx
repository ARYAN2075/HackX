import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({ id, message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  const config = {
    success: {
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    error: {
      icon: XCircle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
    info: {
      icon: Info,
      color: 'var(--cyber-cyan)',
      bg: 'rgba(0, 217, 255, 0.08)',
      border: 'rgba(0, 217, 255, 0.3)',
      glow: 'rgba(0, 217, 255, 0.15)',
    },
    warning: {
      icon: AlertTriangle,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
  };

  const { icon: Icon, color, bg, border, glow } = config[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="relative overflow-hidden rounded-2xl backdrop-blur-xl min-w-[300px] max-w-[400px]"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: `0 0 25px ${glow}, 0 8px 32px rgba(0, 0, 0, 0.35)`,
      }}
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        style={{ background: color }}
      />

      <div className="p-4 flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
        </motion.div>
        <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--cyber-white)' }}>
          {message}
        </p>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 hover:opacity-70 transition-opacity ml-1"
          style={{ color: 'var(--cyber-white)', opacity: 0.5 }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
