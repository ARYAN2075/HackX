import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Type, Maximize2, Keyboard, Clock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  isDarkMode = true,
  onToggleDarkMode,
}: SettingsModalProps) {
  const [fontSize, setFontSize] = useState(16);
  const [spacing, setSpacing] = useState(1);
  const [historyEnabled, setHistoryEnabled] = useState(true);

  const keyboardShortcuts = [
    { key: 'Ctrl + K', action: 'Open command palette' },
    { key: 'Ctrl + U', action: 'Upload document' },
    { key: 'Ctrl + /', action: 'Focus chat input' },
    { key: 'Ctrl + H', action: 'View history' },
    { key: 'Esc', action: 'Close modals' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl"
              style={{
                background: 'var(--cyber-navy)',
                border: '1px solid rgba(0,243,255,0.3)',
                boxShadow: '0 0 60px rgba(0,243,255,0.15), 0 24px 48px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'rgba(0,243,255,0.2)' }}
              >
                <h2 style={{ color: 'var(--cyber-aqua)' }}>Settings</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5"
                  style={{ color: 'var(--cyber-white)' }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto cyber-scrollbar" style={{ maxHeight: 'calc(92vh - 80px)' }}>
                <div className="space-y-8">

                  {/* ── Appearance ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-4" style={{ color: 'var(--cyber-white)' }}>
                      <Sun size={18} style={{ color: 'var(--cyber-cyan)' }} />
                      Appearance
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm" style={{ color: 'var(--cyber-white)' }}>
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--cyber-white)', opacity: 0.6 }}>
                          {isDarkMode ? 'Switch to light aqua theme' : 'Switch to dark navy theme'}
                        </div>
                      </div>
                      <button
                        onClick={onToggleDarkMode}
                        className="relative w-14 h-7 rounded-full transition-all"
                        style={{ background: isDarkMode ? 'var(--cyber-cyan)' : 'rgba(255,255,255,0.2)' }}
                      >
                        <motion.div
                          animate={{ x: isDarkMode ? 28 : 2 }}
                          className="absolute top-1 w-5 h-5 rounded-full"
                          style={{ background: 'var(--cyber-navy)' }}
                        >
                          {isDarkMode ? (
                            <Moon size={12} className="absolute inset-0 m-auto" style={{ color: 'var(--cyber-cyan)' }} />
                          ) : (
                            <Sun size={12} className="absolute inset-0 m-auto" style={{ color: '#fbbf24' }} />
                          )}
                        </motion.div>
                      </button>
                    </div>
                  </div>

                  {/* ── Typography ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-4" style={{ color: 'var(--cyber-white)' }}>
                      <Type size={18} style={{ color: 'var(--cyber-cyan)' }} />
                      Typography
                    </h3>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: 'var(--cyber-white)' }}>Font Size</span>
                        <span className="text-sm" style={{ color: 'var(--cyber-cyan)' }}>{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--cyber-cyan) 0%, var(--cyber-cyan) ${((fontSize - 12) / 8) * 100}%, rgba(0,243,255,0.15) ${((fontSize - 12) / 8) * 100}%, rgba(0,243,255,0.15) 100%)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Spacing ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-4" style={{ color: 'var(--cyber-white)' }}>
                      <Maximize2 size={18} style={{ color: 'var(--cyber-cyan)' }} />
                      Spacing
                    </h3>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: 'var(--cyber-white)' }}>Content Spacing</span>
                        <span className="text-sm" style={{ color: 'var(--cyber-cyan)' }}>{spacing}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={spacing}
                        onChange={(e) => setSpacing(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--cyber-cyan) 0%, var(--cyber-cyan) ${((spacing - 0.8) / 0.7) * 100}%, rgba(0,243,255,0.15) ${((spacing - 0.8) / 0.7) * 100}%, rgba(0,243,255,0.15) 100%)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Privacy ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-4" style={{ color: 'var(--cyber-white)' }}>
                      <Clock size={18} style={{ color: 'var(--cyber-cyan)' }} />
                      Privacy
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm" style={{ color: 'var(--cyber-white)' }}>Personal History</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--cyber-white)', opacity: 0.6 }}>Save your chat history and queries</div>
                      </div>
                      <button
                        onClick={() => setHistoryEnabled(!historyEnabled)}
                        className="relative w-14 h-7 rounded-full transition-all"
                        style={{ background: historyEnabled ? 'var(--cyber-cyan)' : 'rgba(255,255,255,0.2)' }}
                      >
                        <motion.div
                          animate={{ x: historyEnabled ? 28 : 2 }}
                          className="absolute top-1 w-5 h-5 rounded-full"
                          style={{ background: 'var(--cyber-navy)' }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ── Keyboard Shortcuts ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-4" style={{ color: 'var(--cyber-white)' }}>
                      <Keyboard size={18} style={{ color: 'var(--cyber-cyan)' }} />
                      Keyboard Shortcuts
                    </h3>
                    <div className="space-y-2">
                      {keyboardShortcuts.map((sc, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: 'rgba(0,243,255,0.04)', border: '1px solid rgba(0,243,255,0.1)' }}
                        >
                          <span className="text-sm" style={{ color: 'var(--cyber-white)', opacity: 0.8 }}>{sc.action}</span>
                          <kbd
                            className="px-2 py-1 rounded text-xs"
                            style={{ background: 'rgba(0,243,255,0.15)', color: 'var(--cyber-cyan)', border: '1px solid rgba(0,243,255,0.4)' }}
                          >
                            {sc.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
