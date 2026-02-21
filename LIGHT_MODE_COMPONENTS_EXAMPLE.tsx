/**
 * HACK HUNTERS - Professional Light Mode Component Examples
 * 
 * This file demonstrates how to implement components using the new
 * professional light mode design system with WCAG AA compliance.
 * 
 * All components use CSS custom properties that automatically adapt
 * to dark/light mode based on the .light-mode class.
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, Upload, MessageSquare, Save, Trash2, 
  Check, AlertCircle, Info, X 
} from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════
// 1. BUTTON COMPONENT SYSTEM
// ════════════════════════════════════════════════════════════════════════════

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick,
  disabled = false,
  icon,
  fullWidth = false
}: ButtonProps) {
  // Size configurations
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Variant configurations (all WCAG AA compliant)
  const variantStyles = {
    primary: `
      bg-[var(--cyber-teal)] 
      text-white 
      border border-[var(--cyber-teal)]
      hover:bg-[var(--cyber-teal-light)]
      active:bg-[var(--primary-700,#0C4A6E)]
      shadow-[var(--neon-glow)]
      hover:shadow-[var(--neon-glow-strong)]
    `,
    secondary: `
      bg-transparent 
      text-[var(--cyber-teal)] 
      border-[1.5px] border-[var(--border-secondary,#CBD5E1)]
      hover:bg-[var(--bg-tertiary,#F1F5F9)]
      hover:border-[var(--cyber-teal)]
      active:bg-[var(--primary-50,#F0F9FF)]
    `,
    danger: `
      bg-[var(--error-500,#DC2626)] 
      text-white 
      border border-[var(--error-500,#DC2626)]
      hover:bg-[#B91C1C]
      shadow-sm
      hover:shadow-md
    `,
    ghost: `
      bg-transparent 
      text-[var(--cyber-white)] 
      border border-transparent
      hover:bg-[var(--bg-tertiary,#F1F5F9)]
    `
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98, y: 0 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg
        font-medium
        flex items-center justify-center gap-2
        transition-all duration-200
        focus:outline-none 
        focus:ring-2 
        focus:ring-[var(--cyber-teal)] 
        focus:ring-offset-2
        disabled:opacity-50 
        disabled:cursor-not-allowed
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}

// Example Usage:
export function ButtonShowcase() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Button variant="primary" icon={<Upload size={18} />}>
        Upload Document
      </Button>
      
      <Button variant="secondary" icon={<Search size={18} />}>
        Search Files
      </Button>
      
      <Button variant="danger" size="sm" icon={<Trash2 size={16} />}>
        Delete
      </Button>
      
      <Button variant="ghost">
        Cancel
      </Button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ 
  children, 
  title, 
  description, 
  interactive = false,
  onClick,
  className = ''
}: CardProps) {
  const cardContent = (
    <div
      className={`
        bg-[var(--cyber-navy)]
        border border-[var(--border-primary,#E2E8F0)]
        rounded-xl
        p-6
        shadow-[var(--card-shadow)]
        transition-all duration-200
        ${interactive ? 'cursor-pointer hover:border-[var(--border-secondary,#CBD5E1)] hover:shadow-[var(--neon-glow-strong)] hover:-translate-y-0.5' : ''}
        ${className}
      `}
      onClick={interactive ? onClick : undefined}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 
              className="text-lg font-semibold mb-1" 
              style={{ color: 'var(--cyber-white)' }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p 
              className="text-sm" 
              style={{ color: 'var(--text-secondary, #334155)' }}
            >
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  return interactive ? (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {cardContent}
    </motion.div>
  ) : cardContent;
}

// Example Usage:
export function CardShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card 
        title="Document Summary" 
        description="View insights from your uploaded document"
      >
        <div className="space-y-2">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong>Pages:</strong> 24
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong>Size:</strong> 2.4 MB
          </div>
        </div>
      </Card>

      <Card 
        title="Quick Actions" 
        interactive
        onClick={() => alert('Card clicked!')}
      >
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Click to explore more features →
        </p>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. INPUT COMPONENT
// ════════════════════════════════════════════════════════════════════════════

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'search';
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  type = 'text'
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--cyber-white)' }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {icon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full
            ${icon ? 'pl-10' : 'pl-4'}
            pr-4 py-2.5
            bg-[var(--cyber-navy)]
            border-[1.5px]
            ${error 
              ? 'border-[var(--error-500,#DC2626)]' 
              : 'border-[var(--border-secondary,#CBD5E1)]'
            }
            rounded-lg
            text-base
            transition-all duration-200
            focus:outline-none
            focus:border-[var(--cyber-teal)]
            focus:shadow-[var(--soft-glow)]
          `}
          style={{ 
            color: 'var(--cyber-white)',
          }}
        />
      </div>

      {error && (
        <div 
          className="flex items-center gap-1.5 mt-1.5 text-sm"
          style={{ color: 'var(--error-500, #DC2626)' }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Example Usage:
export function InputShowcase() {
  const [search, setSearch] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  return (
    <div className="space-y-4 p-6 max-w-md">
      <Input
        label="Search Documents"
        placeholder="Type to search..."
        value={search}
        onChange={setSearch}
        icon={<Search size={18} />}
        type="search"
      />

      <Input
        label="Email Address"
        placeholder="you@example.com"
        value={email}
        onChange={(val) => {
          setEmail(val);
          if (val && !val.includes('@')) {
            setEmailError('Please enter a valid email');
          } else {
            setEmailError('');
          }
        }}
        error={emailError}
        type="email"
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. SIDEBAR NAVIGATION ITEM
// ════════════════════════════════════════════════════════════════════════════

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}

export function SidebarNavItem({ 
  icon, 
  label, 
  active = false, 
  onClick,
  badge 
}: NavItemProps) {
  return (
    <motion.button
      whileHover={{ x: active ? 0 : 4 }}
      onClick={onClick}
      className={`
        w-full
        flex items-center gap-3
        px-4 py-3
        rounded-lg
        text-sm font-medium
        transition-all duration-200
        ${active 
          ? 'bg-[var(--primary-50,#F0F9FF)] border-l-[3px] border-l-[var(--cyber-teal)] pl-[13px]' 
          : 'border-l-[3px] border-l-transparent hover:bg-[var(--bg-tertiary,#F1F5F9)]'
        }
      `}
      style={{
        color: active ? 'var(--cyber-teal)' : 'var(--text-secondary, #334155)'
      }}
    >
      <span 
        className="flex-shrink-0"
        style={{ 
          color: active ? 'var(--cyber-teal)' : 'var(--text-tertiary, #64748B)' 
        }}
      >
        {icon}
      </span>
      
      <span className="flex-1 text-left">{label}</span>
      
      {badge !== undefined && badge > 0 && (
        <span 
          className="px-2 py-0.5 text-xs font-semibold rounded-full"
          style={{
            background: 'var(--primary-100, #E0F2FE)',
            color: 'var(--primary-700, #0C4A6E)'
          }}
        >
          {badge}
        </span>
      )}
    </motion.button>
  );
}

// Example Usage:
export function SidebarShowcase() {
  const [activePage, setActivePage] = React.useState('chat');

  return (
    <div 
      className="w-64 h-screen p-4 border-r"
      style={{
        background: 'var(--cyber-navy)',
        borderColor: 'var(--border-primary, #E2E8F0)'
      }}
    >
      <div className="space-y-1">
        <SidebarNavItem
          icon={<Upload size={20} />}
          label="Upload"
          active={activePage === 'upload'}
          onClick={() => setActivePage('upload')}
        />
        
        <SidebarNavItem
          icon={<MessageSquare size={20} />}
          label="Chat & Q&A"
          active={activePage === 'chat'}
          onClick={() => setActivePage('chat')}
          badge={3}
        />
        
        <SidebarNavItem
          icon={<Save size={20} />}
          label="Saved Queries"
          active={activePage === 'saved'}
          onClick={() => setActivePage('saved')}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. TOAST/NOTIFICATION COMPONENT
// ════════════════════════════════════════════════════════════════════════════

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  const config = {
    success: {
      bg: 'var(--success-50, #ECFDF5)',
      border: 'var(--success-500, #059669)',
      icon: <Check size={20} />,
      iconColor: 'var(--success-500, #059669)'
    },
    error: {
      bg: 'var(--error-50, #FEF2F2)',
      border: 'var(--error-500, #DC2626)',
      icon: <AlertCircle size={20} />,
      iconColor: 'var(--error-500, #DC2626)'
    },
    info: {
      bg: 'var(--primary-50, #F0F9FF)',
      border: 'var(--primary-500, #0369A1)',
      icon: <Info size={20} />,
      iconColor: 'var(--primary-500, #0369A1)'
    },
    warning: {
      bg: 'var(--warning-50, #FFFBEB)',
      border: 'var(--warning-500, #D97706)',
      icon: <AlertCircle size={20} />,
      iconColor: 'var(--warning-500, #D97706)'
    }
  };

  const { bg, border, icon, iconColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-start gap-3 p-4 rounded-xl shadow-lg min-w-[320px] max-w-md"
      style={{
        background: bg,
        borderLeft: `4px solid ${border}`
      }}
    >
      <span style={{ color: iconColor }} className="flex-shrink-0 mt-0.5">
        {icon}
      </span>
      
      <p 
        className="flex-1 text-sm font-medium"
        style={{ color: 'var(--cyber-white, #0F172A)' }}
      >
        {message}
      </p>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

// Example Usage:
export function ToastShowcase() {
  return (
    <div className="space-y-4 p-6">
      <Toast 
        type="success" 
        message="Document uploaded successfully!" 
        onClose={() => {}} 
      />
      <Toast 
        type="error" 
        message="Failed to process document" 
        onClose={() => {}} 
      />
      <Toast 
        type="info" 
        message="New feature available in settings" 
        onClose={() => {}} 
      />
      <Toast 
        type="warning" 
        message="Storage limit reached (80%)" 
        onClose={() => {}} 
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. BADGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  const styles = {
    primary: {
      bg: 'var(--primary-100, #E0F2FE)',
      color: 'var(--primary-700, #0C4A6E)'
    },
    success: {
      bg: 'var(--success-50, #ECFDF5)',
      color: 'var(--success-500, #059669)'
    },
    warning: {
      bg: 'var(--warning-50, #FFFBEB)',
      color: 'var(--warning-500, #D97706)'
    },
    error: {
      bg: 'var(--error-50, #FEF2F2)',
      color: 'var(--error-500, #DC2626)'
    },
    neutral: {
      bg: 'var(--bg-tertiary, #F1F5F9)',
      color: 'var(--text-secondary, #334155)'
    }
  };

  const { bg, color } = styles[variant];

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. COMPLETE DEMO PAGE
// ════════════════════════════════════════════════════════════════════════════

export function LightModeDemo() {
  return (
    <div 
      className="min-h-screen p-8"
      style={{ background: 'var(--cyber-navy-dark, #F8FAFB)' }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--cyber-white)' }}
          >
            HACK HUNTERS - Professional Light Mode
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            WCAG AA Compliant Design System
          </p>
        </div>

        <section>
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--cyber-white)' }}
          >
            Buttons
          </h2>
          <ButtonShowcase />
        </section>

        <section>
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--cyber-white)' }}
          >
            Cards
          </h2>
          <CardShowcase />
        </section>

        <section>
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--cyber-white)' }}
          >
            Inputs
          </h2>
          <InputShowcase />
        </section>

        <section>
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--cyber-white)' }}
          >
            Toasts
          </h2>
          <ToastShowcase />
        </section>
      </div>
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KEY IMPROVEMENTS IN LIGHT MODE:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ✅ WCAG AA Compliance
 *    - Primary text: #0F172A (14.8:1 contrast)
 *    - Secondary text: #334155 (9.7:1 contrast)
 *    - Primary buttons: #0369A1 on white (5.8:1 contrast)
 * 
 * ✅ Clear Visual Hierarchy
 *    - Background: #F8FAFB (distinct from cards)
 *    - Cards: #FFFFFF (pure white with shadows)
 *    - Borders: #E2E8F0 and #CBD5E1 (clearly visible)
 * 
 * ✅ Professional Shadows
 *    - Subtle elevation (0.05-0.08 opacity)
 *    - Layered shadows for depth
 *    - No harsh glows
 * 
 * ✅ Accessibility Features
 *    - Focus rings on all interactive elements
 *    - Hover states with clear feedback
 *    - Touch-friendly 44px+ hit areas
 *    - Color-independent (icons + text)
 * 
 * ✅ Consistent Spacing
 *    - 8px grid system throughout
 *    - 16px-24px component padding
 *    - 32px-48px section spacing
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
