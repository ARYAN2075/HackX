/**
 * Authentication Flow Diagram Component
 * Visual representation of the complete auth system
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  UserPlus, LogIn, Key, LogOut, Shield, 
  CheckCircle, XCircle, Clock, Database,
  ArrowRight, RefreshCw
} from 'lucide-react';

export function AuthFlowDemo() {
  const flows = [
    {
      title: 'First-Time User',
      steps: [
        { icon: UserPlus, label: 'Sign Up', color: '#00F3FF', desc: 'Create account' },
        { icon: Shield, label: 'Validate', color: '#38EFF0', desc: 'Check credentials' },
        { icon: Database, label: 'Save User', color: '#14a1a8', desc: 'Store in DB' },
        { icon: CheckCircle, label: 'Auto Login', color: '#10b981', desc: 'Create session' },
      ],
    },
    {
      title: 'Existing User',
      steps: [
        { icon: LogIn, label: 'Login', color: '#00F3FF', desc: 'Enter credentials' },
        { icon: Shield, label: 'Verify', color: '#38EFF0', desc: 'Check password' },
        { icon: Database, label: 'Find User', color: '#14a1a8', desc: 'Query DB' },
        { icon: CheckCircle, label: 'Success', color: '#10b981', desc: 'Start session' },
      ],
    },
    {
      title: 'Password Reset',
      steps: [
        { icon: Key, label: 'Forgot?', color: '#00F3FF', desc: 'Enter email' },
        { icon: Shield, label: 'Verify Email', color: '#38EFF0', desc: 'Check exists' },
        { icon: RefreshCw, label: 'Reset', color: '#14a1a8', desc: 'New password' },
        { icon: CheckCircle, label: 'Updated', color: '#10b981', desc: 'Save to DB' },
      ],
    },
  ];

  const features = [
    { icon: CheckCircle, label: 'Email Validation', desc: 'Real-time format checking', color: '#10b981' },
    { icon: Shield, label: 'Password Strength', desc: '4-level strength meter', color: '#00F3FF' },
    { icon: Clock, label: 'Session Management', desc: '1 or 7 day expiry', color: '#38EFF0' },
    { icon: Database, label: 'LocalStorage DB', desc: 'Simulated backend', color: '#14a1a8' },
  ];

  const errors = [
    { icon: XCircle, label: 'Invalid Email', example: 'test@com' },
    { icon: XCircle, label: 'Wrong Password', example: 'Incorrect credentials' },
    { icon: XCircle, label: 'Passwords Mismatch', example: 'Confirm password error' },
    { icon: XCircle, label: 'Account Exists', example: 'Email already registered' },
  ];

  return (
    <div className="h-full overflow-y-auto cyber-scrollbar p-8" style={{ background: 'var(--cyber-navy-dark)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: 'rgba(0,243,255,0.08)',
              border: '1px solid rgba(0,243,255,0.25)',
            }}
          >
            <Shield size={16} style={{ color: '#00F3FF' }} />
            <span className="text-sm" style={{ color: '#00F3FF' }}>Authentication System Documentation</span>
          </div>
          <h1 className="mb-3" style={{ color: '#E8F4F8' }}>Complete Auth Flow</h1>
          <p className="text-sm max-w-2xl mx-auto" style={{ color: '#E8F4F8', opacity: 0.6 }}>
            Visual guide to the authentication system with login, signup, password reset, and session management
          </p>
        </motion.div>

        {/* Main Flows */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {flows.map((flow, flowIdx) => (
            <motion.div
              key={flow.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: flowIdx * 0.1 }}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(13,115,119,0.07)',
                border: '1px solid rgba(0,243,255,0.2)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <h3 className="mb-6 text-center" style={{ color: '#E8F4F8' }}>{flow.title}</h3>
              
              <div className="space-y-4">
                {flow.steps.map((step, stepIdx) => (
                  <React.Fragment key={stepIdx}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: flowIdx * 0.1 + stepIdx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${step.color}15`,
                          border: `1px solid ${step.color}40`,
                          boxShadow: `0 0 16px ${step.color}20`,
                        }}
                      >
                        <step.icon size={20} style={{ color: step.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-0.5" style={{ color: '#E8F4F8' }}>
                          {step.label}
                        </div>
                        <div className="text-xs" style={{ color: '#E8F4F8', opacity: 0.5 }}>
                          {step.desc}
                        </div>
                      </div>
                    </motion.div>
                    
                    {stepIdx < flow.steps.length - 1 && (
                      <div className="flex items-center justify-center">
                        <ArrowRight size={16} style={{ color: '#00F3FF', opacity: 0.3 }} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="mb-4" style={{ color: '#E8F4F8' }}>Key Features</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl p-4 text-center"
                style={{
                  background: 'rgba(13,115,119,0.07)',
                  border: `1px solid ${feature.color}25`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}40`,
                  }}
                >
                  <feature.icon size={18} style={{ color: feature.color }} />
                </div>
                <div className="text-sm mb-1" style={{ color: '#E8F4F8' }}>{feature.label}</div>
                <div className="text-xs" style={{ color: '#E8F4F8', opacity: 0.5 }}>{feature.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error Handling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="mb-4" style={{ color: '#E8F4F8' }}>Error Handling</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
              >
                <error.icon size={20} style={{ color: '#f87171' }} />
                <div>
                  <div className="text-sm mb-0.5" style={{ color: '#f87171' }}>{error.label}</div>
                  <div className="text-xs" style={{ color: '#E8F4F8', opacity: 0.4 }}>{error.example}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Session Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(13,115,119,0.07)',
            border: '1px solid rgba(0,243,255,0.2)',
          }}
        >
          <h2 className="mb-4" style={{ color: '#E8F4F8' }}>Session Management</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm mb-3" style={{ color: '#00F3FF' }}>Normal Session</h3>
              <div className="space-y-2 text-sm" style={{ color: '#E8F4F8', opacity: 0.7 }}>
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: '#00F3FF' }} />
                  <span>Duration: 1 day (24 hours)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database size={14} style={{ color: '#00F3FF' }} />
                  <span>Stored in localStorage</span>
                </div>
                <div className="flex items-center gap-2">
                  <LogOut size={14} style={{ color: '#00F3FF' }} />
                  <span>Auto-expires after timeout</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm mb-3" style={{ color: '#10b981' }}>"Remember Me" Session</h3>
              <div className="space-y-2 text-sm" style={{ color: '#E8F4F8', opacity: 0.7 }}>
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: '#10b981' }} />
                  <span>Duration: 7 days (168 hours)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database size={14} style={{ color: '#10b981' }} />
                  <span>Persistent in localStorage</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} style={{ color: '#10b981' }} />
                  <span>Survives browser close</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div
            className="inline-block rounded-xl px-6 py-4"
            style={{
              background: 'rgba(0,243,255,0.06)',
              border: '1px solid rgba(0,243,255,0.15)',
            }}
          >
            <div className="text-sm mb-2" style={{ color: '#E8F4F8', opacity: 0.6 }}>
              Built with
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: '#00F3FF' }}>
              <span>React + TypeScript</span>
              <span>•</span>
              <span>Motion (Framer Motion)</span>
              <span>•</span>
              <span>LocalStorage API</span>
              <span>•</span>
              <span>Tailwind CSS v4</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
