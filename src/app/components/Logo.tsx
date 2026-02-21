import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { iconSize: 18, textClass: 'text-lg', subClass: 'text-xs', padding: 'p-2', gap: 'gap-2.5' },
    md: { iconSize: 24, textClass: 'text-2xl', subClass: 'text-xs', padding: 'p-2.5', gap: 'gap-3' },
    lg: { iconSize: 38, textClass: 'text-4xl', subClass: 'text-sm', padding: 'p-3', gap: 'gap-4' },
  };

  const { iconSize, textClass, subClass, padding, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Icon container with 3D depth effect */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 5 }}
        className={`relative rounded-2xl ${padding} flex-shrink-0`}
        style={{
          background: 'linear-gradient(135deg, #0d7377 0%, #00F3FF 100%)',
          boxShadow: '0 0 25px rgba(0,243,255,0.45), 0 0 50px rgba(0,243,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-0 rounded-2xl opacity-60"
          style={{
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 55%)',
          }}
        />
        {/* Bottom shadow for 3D */}
        <div
          className="absolute -bottom-1.5 left-1 right-1 h-2 rounded-b-xl opacity-40 blur-sm"
          style={{ background: 'rgba(0,243,255,0.6)' }}
        />
        <Zap size={iconSize} style={{ color: '#0A0F1E', position: 'relative', zIndex: 1 }} />
      </motion.div>

      {/* Text */}
      <div>
        <div
          className={`${textClass} tracking-tight`}
          style={{
            fontWeight: 900,
            color: '#00F3FF',
            textShadow: '0 0 14px rgba(0,243,255,0.65), 0 0 28px rgba(0,243,255,0.3)',
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          HACK HUNTERS
        </div>
        {size !== 'sm' && (
          <div
            className={`${subClass} tracking-widest uppercase mt-0.5`}
            style={{
              color: '#38EFF0',
              opacity: 0.7,
              letterSpacing: '0.15em',
            }}
          >
            Smart Document Assistant
          </div>
        )}
      </div>
    </div>
  );
}
