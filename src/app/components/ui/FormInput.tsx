/**
 * Reusable Form Input Component
 * Used across authentication forms for consistency
 */

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, LucideIcon } from 'lucide-react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
  required?: boolean;
  autoComplete?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  success,
  required,
  autoComplete,
  onFocus,
  onBlur,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const baseStyle = {
    background: 'rgba(10, 14, 39, 0.6)',
    border: error
      ? '1px solid rgba(239,68,68,0.5)'
      : success
      ? '1px solid rgba(16,185,129,0.5)'
      : isFocused
      ? '1px solid var(--cyber-cyan)'
      : '1px solid rgba(0, 217, 255, 0.25)',
    color: 'var(--cyber-white)',
    boxShadow: isFocused ? '0 0 14px rgba(0,217,255,0.2)' : 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm mb-2" style={{ color: '#E8F4F8', opacity: 0.8 }}>
        {label}
        {required && <span style={{ color: '#f87171' }}> *</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <Icon
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            size={18}
            style={{ color: '#00F3FF', opacity: 0.5 }}
          />
        )}

        {/* Input Field */}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl pl-12 pr-12 py-3.5 outline-none text-sm"
          style={baseStyle}
        />

        {/* Right Icon - Password Toggle or Status */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:opacity-80 transition-opacity"
              style={{ color: '#00F3FF', opacity: 0.5 }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : error ? (
            <AlertCircle size={18} style={{ color: '#f87171' }} />
          ) : success ? (
            <CheckCircle size={18} style={{ color: '#10b981' }} />
          ) : null}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mt-2 text-xs flex items-center gap-1 animate-in slide-in-from-left-2"
          style={{ color: '#f87171' }}
        >
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && !error && (
        <div
          className="mt-2 text-xs flex items-center gap-1 animate-in slide-in-from-left-2"
          style={{ color: '#10b981' }}
        >
          <CheckCircle size={12} />
          <span>Looks good!</span>
        </div>
      )}
    </div>
  );
}

/**
 * Example Usage:
 * 
 * import { FormInput } from './components/ui/FormInput';
 * import { Mail, Lock, User } from 'lucide-react';
 * 
 * <FormInput
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   placeholder="your.email@example.com"
 *   icon={Mail}
 *   error={emailError}
 *   required
 * />
 * 
 * <FormInput
 *   label="Password"
 *   type="password"
 *   value={password}
 *   onChange={setPassword}
 *   placeholder="Enter your password"
 *   icon={Lock}
 *   error={passwordError}
 *   required
 * />
 */
