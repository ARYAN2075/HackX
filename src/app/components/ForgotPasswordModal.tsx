import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader, CheckCircle, KeyRound } from 'lucide-react';
import { findUserByEmail, resetPassword } from '../utils/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'email' | 'sent' | 'reset' | 'done';

export function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = {
    background: 'rgba(10, 14, 39, 0.5)',
    border: '1px solid rgba(0, 217, 255, 0.25)',
    color: 'var(--cyber-white)',
  };

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    
    // Check if user exists
    const user = findUserByEmail(email);
    if (!user) {
      setError('No account found with this email address');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('sent');
    }, 1800);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword) { setError('Please enter a new password'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    
    setIsLoading(true);
    setTimeout(() => {
      const result = resetPassword(email, newPassword);
      
      if (!result.success) {
        setError(result.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
      setStep('done');
      setTimeout(() => { onClose(); onSuccess?.(); }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('email');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }, 300);
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1px solid var(--cyber-cyan)';
    e.target.style.boxShadow = '0 0 14px rgba(0,217,255,0.2)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1px solid rgba(0, 217, 255, 0.25)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background: 'var(--cyber-navy)',
                border: '1px solid rgba(0, 217, 255, 0.25)',
                boxShadow: '0 0 60px rgba(0,217,255,0.12), 0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'rgba(0, 217, 255, 0.18)', background: 'rgba(13,115,119,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.3)' }}
                  >
                    <KeyRound size={17} style={{ color: 'var(--cyber-cyan)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm" style={{ color: 'var(--cyber-aqua)' }}>Reset Password</h3>
                    {/* Step indicator */}
                    <div className="flex items-center gap-1 mt-0.5">
                      {(['email', 'sent', 'reset', 'done'] as Step[]).map((s, i) => (
                        <div
                          key={s}
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: s === step ? 18 : 6,
                            background: s === step ? 'var(--cyber-cyan)' : 'rgba(0,217,255,0.2)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-lg"
                  style={{ color: 'var(--cyber-white)', opacity: 0.6 }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Step 1 – Email */}
                  {step === 'email' && (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-5">
                        <h2 className="mb-1" style={{ color: 'var(--cyber-white)' }}>Forgot Password?</h2>
                        <p className="text-sm" style={{ color: 'var(--cyber-white)', opacity: 0.55 }}>
                          Enter your registered email address and we'll send you a reset link.
                        </p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 px-4 py-3 rounded-xl text-sm"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleSendLink} className="space-y-4">
                        <div>
                          <label className="block text-sm mb-2" style={{ color: 'var(--cyber-white)', opacity: 0.8 }}>
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }} />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your.email@example.com"
                              className="w-full rounded-xl pl-11 pr-4 py-3.5 outline-none"
                              style={inputStyle}
                              onFocus={focusStyle}
                              onBlur={blurStyle}
                            />
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          disabled={isLoading}
                          className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2"
                          style={{
                            background: isLoading ? 'rgba(0,217,255,0.3)' : 'linear-gradient(135deg, var(--cyber-teal), var(--cyber-cyan))',
                            color: 'var(--cyber-navy)',
                            boxShadow: isLoading ? 'none' : '0 0 22px rgba(0,217,255,0.4)',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isLoading ? (
                            <><Loader size={17} className="animate-spin" /><span className="font-semibold">Sending...</span></>
                          ) : (
                            <><span className="font-semibold">Send Reset Link</span><ArrowRight size={17} /></>
                          )}
                        </motion.button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 2 – Email Sent */}
                  {step === 'sent' && (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{
                          background: 'rgba(0,217,255,0.1)',
                          border: '2px solid rgba(0,217,255,0.35)',
                          boxShadow: '0 0 30px rgba(0,217,255,0.2)',
                        }}
                      >
                        <Mail size={36} style={{ color: 'var(--cyber-cyan)' }} />
                      </motion.div>

                      <h2 className="mb-3" style={{ color: 'var(--cyber-aqua)' }}>Check Your Email</h2>
                      <p className="text-sm mb-2" style={{ color: 'var(--cyber-white)', opacity: 0.7 }}>
                        Password reset link sent to:
                      </p>
                      <p className="text-sm mb-5 px-3 py-2 rounded-lg inline-block" style={{ color: 'var(--cyber-cyan)', background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.2)' }}>
                        {email}
                      </p>
                      <p className="text-xs mb-6" style={{ color: 'var(--cyber-white)', opacity: 0.45 }}>
                        Didn't receive the email? Check your spam folder or try again.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep('email')}
                          className="flex-1 py-3 rounded-xl text-sm"
                          style={{ background: 'rgba(0,217,255,0.06)', border: '1px solid rgba(0,217,255,0.2)', color: 'var(--cyber-white)' }}
                        >
                          Try Again
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setStep('reset')}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg, var(--cyber-teal), var(--cyber-cyan))', color: 'var(--cyber-navy)', boxShadow: '0 0 18px rgba(0,217,255,0.35)' }}
                        >
                          Enter New Password <ArrowRight size={15} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 – Reset Password */}
                  {step === 'reset' && (
                    <motion.div
                      key="reset"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-5">
                        <h2 className="mb-1" style={{ color: 'var(--cyber-white)' }}>Set New Password</h2>
                        <p className="text-sm" style={{ color: 'var(--cyber-white)', opacity: 0.55 }}>
                          Create a strong password with at least 8 characters.
                        </p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 px-4 py-3 rounded-xl text-sm"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleReset} className="space-y-4">
                        {/* New Password */}
                        <div>
                          <label className="block text-sm mb-2" style={{ color: 'var(--cyber-white)', opacity: 0.8 }}>New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }} />
                            <input
                              type={showNew ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="w-full rounded-xl pl-11 pr-11 py-3.5 outline-none"
                              style={inputStyle}
                              onFocus={focusStyle}
                              onBlur={blurStyle}
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }}>
                              {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                          </div>
                          {/* Password strength */}
                          {newPassword && (
                            <div className="mt-2 flex gap-1">
                              {[1,2,3,4].map((i) => (
                                <div key={i} className="h-1 flex-1 rounded-full" style={{
                                  background: newPassword.length >= i * 2
                                    ? i <= 2 ? '#f59e0b' : i === 3 ? '#10b981' : 'var(--cyber-cyan)'
                                    : 'rgba(255,255,255,0.1)'
                                }} />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm mb-2" style={{ color: 'var(--cyber-white)', opacity: 0.8 }}>Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }} />
                            <input
                              type={showConfirm ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm your password"
                              className="w-full rounded-xl pl-11 pr-11 py-3.5 outline-none"
                              style={inputStyle}
                              onFocus={focusStyle}
                              onBlur={blurStyle}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }}>
                              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                          </div>
                          {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>Passwords do not match</p>
                          )}
                          {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 8 && (
                            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#10b981' }}>
                              <CheckCircle size={11} /> Passwords match
                            </p>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          disabled={isLoading}
                          className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2"
                          style={{
                            background: isLoading ? 'rgba(0,217,255,0.3)' : 'linear-gradient(135deg, var(--cyber-teal), var(--cyber-cyan))',
                            color: 'var(--cyber-navy)',
                            boxShadow: isLoading ? 'none' : '0 0 22px rgba(0,217,255,0.4)',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isLoading ? (
                            <><Loader size={17} className="animate-spin" /><span className="font-semibold">Saving...</span></>
                          ) : (
                            <><span className="font-semibold">Save New Password</span><ArrowRight size={17} /></>
                          )}
                        </motion.button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 4 – Success */}
                  {step === 'done' && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 280, delay: 0.1 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          border: '2px solid rgba(16,185,129,0.4)',
                          boxShadow: '0 0 30px rgba(16,185,129,0.2)',
                        }}
                      >
                        <CheckCircle size={38} style={{ color: '#10b981' }} />
                      </motion.div>
                      <h2 className="mb-3" style={{ color: '#10b981' }}>Password Updated!</h2>
                      <p className="text-sm" style={{ color: 'var(--cyber-white)', opacity: 0.6 }}>
                        Your password has been reset successfully. Redirecting...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}