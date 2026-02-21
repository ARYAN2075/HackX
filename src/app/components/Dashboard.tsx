import React from 'react';
import { motion } from 'motion/react';
import {
  Upload as UploadIcon,
  FileText,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Brain,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { AppDocument } from '../App';

interface DashboardProps {
  onNavigate: (page: string) => void;
  activeDocument: AppDocument | null;
  chatCount: number;
}

const suggestedQueries = [
  'What is the main topic of this document?',
  'Summarize the key findings in 3 points',
  'What are the most important conclusions?',
  'List the main recommendations',
  'Explain the methodology used',
];

export function Dashboard({ onNavigate, activeDocument, chatCount }: DashboardProps) {
  const hasDocuments = activeDocument !== null;

  const stats = [
    {
      icon: FileText,
      label: 'Active Document',
      value: hasDocuments ? '1' : '0',
      sub: hasDocuments ? activeDocument.name : 'No document yet',
      color: '#00F3FF',
      positive: hasDocuments,
      bg: 'rgba(0, 243, 255, 0.06)',
      border: 'rgba(0, 243, 255, 0.25)',
    },
    {
      icon: MessageSquare,
      label: 'Chat Sessions',
      value: chatCount.toString(),
      sub: chatCount > 0 ? `${chatCount} conversation${chatCount > 1 ? 's' : ''}` : 'Start chatting',
      color: '#38EFF0',
      positive: chatCount > 0,
      bg: 'rgba(56, 239, 240, 0.06)',
      border: 'rgba(56, 239, 240, 0.22)',
    },
    {
      icon: Activity,
      label: 'Document Status',
      value: hasDocuments ? 'READY' : 'IDLE',
      sub: hasDocuments ? 'Document loaded' : 'Upload to activate',
      color: '#14a1a8',
      positive: hasDocuments,
      bg: 'rgba(20, 161, 168, 0.06)',
      border: 'rgba(20, 161, 168, 0.22)',
    },
  ];

  const quickActions = [
    { label: 'Upload Doc', icon: UploadIcon, page: 'upload', color: '#00F3FF', desc: 'Add a document' },
    { label: 'Chat', icon: MessageSquare, page: 'chat', color: '#38EFF0', desc: 'Ask questions', disabled: !hasDocuments },
    { label: 'FAQ / Q&A', icon: Sparkles, page: 'faq', color: '#14a1a8', desc: 'Browse suggestions' },
    { label: 'History', icon: Clock, page: 'history', color: 'rgba(232,244,248,0.65)', desc: 'Past sessions' },
  ];

  return (
    <div className="h-full overflow-y-auto cyber-scrollbar" style={{ background: 'var(--cyber-navy-dark)' }}>
      {/* Hero Banner */}
      <div
        className="relative px-8 pt-8 pb-6 border-b overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(13,115,119,0.12) 0%, rgba(0,243,255,0.04) 100%)',
          borderColor: 'rgba(0, 243, 255, 0.12)',
        }}
      >
        {/* Animated mesh bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,243,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            animation: 'neural-pulse 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 90% 50%, rgba(0,243,255,0.07) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Brain size={22} style={{ color: '#00F3FF' }} />
              </motion.div>
              <h1 style={{ color: '#38EFF0' }}>Dashboard</h1>
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: hasDocuments ? 'rgba(16,185,129,0.12)' : 'rgba(0,243,255,0.08)',
                  border: hasDocuments ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(0,243,255,0.25)',
                  color: hasDocuments ? '#10b981' : '#00F3FF',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: hasDocuments ? '#10b981' : '#00F3FF',
                    boxShadow: `0 0 6px ${hasDocuments ? '#10b981' : '#00F3FF'}`,
                    display: 'inline-block',
                  }}
                />
                {hasDocuments ? 'Active Session' : 'Ready'}
              </div>
            </div>
            <p className="text-sm" style={{ color: '#E8F4F8', opacity: 0.5 }}>
              {hasDocuments
                ? `Viewing: "${activeDocument.name}" — ${activeDocument.pages} pages`
                : 'Upload your first document to get started.'}
            </p>
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(13,115,119,0.4), rgba(0,243,255,0.2))',
                border: '1px solid rgba(0,243,255,0.3)',
                boxShadow: '0 0 30px rgba(0,243,255,0.2)',
              }}
            >
              <Activity size={28} style={{ color: '#00F3FF' }} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
              className="rounded-2xl p-5 relative overflow-hidden group cursor-default card-3d"
              style={{
                background: stat.bg,
                border: `1px solid ${stat.border}`,
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Glow top-right */}
              <div
                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{ background: `radial-gradient(circle at 100% 0%, ${stat.color}12, transparent 70%)` }}
              />
              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}80, transparent)` }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${stat.color}15`,
                      border: `1px solid ${stat.color}40`,
                      boxShadow: `0 0 16px ${stat.color}20`,
                    }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  {stat.positive && (
                    <div className="flex items-center gap-1" style={{ color: '#10b981' }}>
                      <TrendingUp size={13} />
                      <span className="text-xs">Active</span>
                    </div>
                  )}
                </div>

                <div
                  className="mb-1"
                  style={{
                    color: stat.positive ? stat.color : 'rgba(232,244,248,0.25)',
                    textShadow: stat.positive ? `0 0 20px ${stat.color}60` : 'none',
                    fontSize: typeof stat.value === 'string' && stat.value.length > 2 ? '1.5rem' : '2.5rem',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm mb-1" style={{ color: '#E8F4F8', opacity: 0.75 }}>{stat.label}</div>
                <div className="text-xs truncate" style={{ color: stat.positive ? '#10b981' : 'rgba(232,244,248,0.3)' }}>
                  {stat.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        {!hasDocuments ? (
          /* === EMPTY / ONBOARDING STATE === */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{
              background: 'rgba(13, 115, 119, 0.05)',
              border: '2px dashed rgba(0, 243, 255, 0.22)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,243,255,0.06), transparent 70%)',
                animation: 'neural-pulse 4s ease-in-out infinite',
              }}
            />
            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,115,119,0.4), rgba(0,243,255,0.15))',
                  border: '2px solid rgba(0,243,255,0.3)',
                  boxShadow: '0 0 50px rgba(0,243,255,0.2), 0 0 100px rgba(0,243,255,0.08)',
                }}
              >
                <UploadIcon size={44} style={{ color: '#00F3FF', opacity: 0.9 }} />
              </motion.div>

              <h2 className="mb-3" style={{ color: '#E8F4F8' }}>No Documents Uploaded</h2>
              <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: '#E8F4F8', opacity: 0.5 }}>
                Upload your first document to start analyzing, searching, and exploring your content with intelligent Q&A.
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-8">
                {['PDF', 'DOCX', 'TXT'].map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl py-2 px-3 text-xs text-center"
                    style={{ background: 'rgba(0,243,255,0.06)', border: '1px solid rgba(0,243,255,0.15)', color: '#00F3FF' }}
                  >
                    {f}
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0,243,255,0.55)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('upload')}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0d7377, #00F3FF)',
                  color: '#0A0F1E',
                  boxShadow: '0 0 25px rgba(0,243,255,0.4)',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                />
                <UploadIcon size={20} className="relative z-10" />
                <span className="font-semibold relative z-10 tracking-wide">Upload Your First Document</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* === ACTIVE DOCUMENT STATE === */
          <div className="grid md:grid-cols-2 gap-5">
            {/* Active Document card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(13, 115, 119, 0.07)',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 0%, rgba(0,243,255,0.08), transparent 70%)' }}
              />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  <h3 style={{ color: '#E8F4F8' }}>Active Document</h3>
                </div>
                <button
                  onClick={() => onNavigate('upload')}
                  className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg"
                  style={{ color: '#00F3FF', background: 'rgba(0,243,255,0.08)', border: '1px solid rgba(0,243,255,0.2)' }}
                >
                  Replace <ArrowRight size={11} />
                </button>
              </div>

              <div
                className="flex items-center gap-3 p-4 rounded-xl mb-4 cursor-pointer hover:bg-white/5 transition-colors"
                style={{ border: '1px solid rgba(0, 243, 255, 0.12)', background: 'rgba(0,243,255,0.04)' }}
                onClick={() => onNavigate('chat')}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,243,255,0.12)', border: '1px solid rgba(0,243,255,0.3)', boxShadow: '0 0 16px rgba(0,243,255,0.15)' }}
                >
                  <FileText size={20} style={{ color: '#00F3FF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate mb-1" style={{ color: '#E8F4F8' }}>{activeDocument.name}</div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: '#E8F4F8', opacity: 0.4 }}>
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(activeDocument.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{activeDocument.pages} pages</span>
                    <span>{(activeDocument.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: '#00F3FF', opacity: 0.5 }} />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,243,255,0.35)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('chat')}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,115,119,0.5), rgba(0,243,255,0.2))',
                  border: '1px solid rgba(0,243,255,0.35)',
                  color: '#00F3FF',
                  boxShadow: '0 0 15px rgba(0,243,255,0.15)',
                }}
              >
                <MessageSquare size={16} />
                <span>Start Chat</span>
                <ArrowRight size={14} />
              </motion.button>
            </motion.div>

            {/* Recommended Queries card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, type: 'spring' }}
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(13, 115, 119, 0.07)',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles size={16} style={{ color: '#00F3FF' }} />
                  </motion.div>
                  <h3 style={{ color: '#E8F4F8' }}>Query Suggestions</h3>
                </div>
              </div>

              <div className="space-y-2">
                {suggestedQueries.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                    whileHover={{ x: 6, background: 'rgba(0,243,255,0.07)' }}
                    onClick={() => onNavigate('chat')}
                    className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all"
                    style={{ border: '1px solid rgba(0,243,255,0.1)' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#00F3FF', boxShadow: '0 0 6px #00F3FF' }}
                    />
                    <span className="text-sm" style={{ color: '#E8F4F8', opacity: 0.8 }}>{q}</span>
                    <ArrowRight size={12} className="ml-auto flex-shrink-0" style={{ color: '#00F3FF', opacity: 0.4 }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} style={{ color: '#00F3FF' }} />
            <h3 style={{ color: '#E8F4F8', opacity: 0.8 }}>Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.07, type: 'spring' }}
                whileHover={!action.disabled ? { y: -5, scale: 1.03, boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${action.color}20` } : {}}
                whileTap={!action.disabled ? { scale: 0.97 } : {}}
                onClick={() => !action.disabled && onNavigate(action.page)}
                className="rounded-2xl p-5 text-center relative overflow-hidden group"
                style={{
                  background: action.disabled ? 'rgba(255,255,255,0.02)' : `${action.color}07`,
                  border: `1px solid ${action.disabled ? 'rgba(255,255,255,0.06)' : action.color + '25'}`,
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  opacity: action.disabled ? 0.45 : 1,
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Hover glow */}
                {!action.disabled && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${action.color}10, transparent 70%)` }}
                  />
                )}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: `${action.color}14`,
                    border: `1px solid ${action.color}30`,
                    boxShadow: action.disabled ? 'none' : `0 0 16px ${action.color}15`,
                  }}
                >
                  <action.icon size={19} style={{ color: action.color }} />
                </div>
                <div className="text-sm" style={{ color: '#E8F4F8', opacity: action.disabled ? 0.35 : 0.85 }}>{action.label}</div>
                <div className="text-xs mt-0.5" style={{ color: action.color, opacity: action.disabled ? 0.3 : 0.6 }}>{action.disabled ? 'Upload first' : action.desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
