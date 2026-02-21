import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  HelpCircle,
  Bookmark,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userName?: string;
  hasDocuments?: boolean;
  activeDocumentName?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Sidebar({ activePage, onNavigate, onLogout, userName, hasDocuments, activeDocumentName, isDarkMode = true, onToggleTheme }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', locked: false },
    { id: 'upload', icon: Upload, label: 'Upload Document', locked: false },
    { id: 'chat', icon: MessageSquare, label: 'Chat & Q&A', locked: !hasDocuments },
    { id: 'faq', icon: HelpCircle, label: 'FAQ / Suggestions', locked: false },
    { id: 'saved', icon: Bookmark, label: 'Saved Queries', locked: false },
    { id: 'history', icon: History, label: 'History', locked: false },
    { id: 'settings', icon: Settings, label: 'Settings', locked: false },
  ];

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : 'User';

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 270 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen flex flex-col relative flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #0A0F1E 0%, #0d1220 100%)',
        borderRight: '1px solid rgba(0, 243, 255, 0.12)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo Section */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0, 217, 255, 0.15)' }}>
        {!isCollapsed ? (
          <Logo size="sm" />
        ) : (
          <div className="flex justify-center">
            <motion.div
              animate={{ boxShadow: ['0 0 10px rgba(0,217,255,0.3)', '0 0 20px rgba(0,217,255,0.6)', '0 0 10px rgba(0,217,255,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--cyber-teal), var(--cyber-cyan))',
              }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--cyber-navy)' }}>HH</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mx-4 mt-4 p-3 rounded-xl"
          style={{
            background: 'rgba(0, 217, 255, 0.06)',
            border: '1px solid rgba(0, 217, 255, 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--cyber-teal), var(--cyber-cyan))',
              }}
            >
              <User size={15} style={{ color: 'var(--cyber-navy)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate" style={{ color: 'var(--cyber-white)' }}>
                {displayName}
              </div>
              <div className="text-xs" style={{ color: 'var(--cyber-cyan)', opacity: 0.8 }}>
                {hasDocuments ? '● Active Session' : '○ No Documents'}
              </div>
            </div>
          </div>
          {/* Active document name strip */}
          {hasDocuments && activeDocumentName && (
            <div
              className="mt-2 pt-2 border-t flex items-center gap-1.5"
              style={{ borderColor: 'rgba(0,217,255,0.12)' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#10b981', boxShadow: '0 0 4px #10b981' }}
              />
              <span
                className="text-xs truncate"
                style={{ color: 'var(--cyber-white)', opacity: 0.55 }}
                title={activeDocumentName}
              >
                {activeDocumentName}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto cyber-scrollbar">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div key={item.id} className="relative group">
                <motion.button
                  whileHover={!item.locked ? { x: 4 } : {}}
                  whileTap={!item.locked ? { scale: 0.97 } : {}}
                  onClick={() => !item.locked && onNavigate(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
                  style={{
                    background: isActive
                      ? 'rgba(0, 243, 255, 0.12)'
                      : item.locked
                      ? 'rgba(255,255,255,0.02)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(0,243,255,0.45)'
                      : '1px solid transparent',
                    color: isActive
                      ? '#00F3FF'
                      : item.locked
                      ? 'rgba(232,244,248,0.2)'
                      : '#E8F4F8',
                    boxShadow: isActive ? '0 0 15px rgba(0,243,255,0.15)' : 'none',
                    cursor: item.locked ? 'not-allowed' : 'pointer',
                    opacity: item.locked ? 0.5 : 1,
                  }}
                >
                  <item.icon size={19} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm whitespace-nowrap flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Lock badge */}
                  {!isCollapsed && item.locked && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(232,244,248,0.3)',
                        fontSize: '9px',
                      }}
                    >
                      UPLOAD FIRST
                    </span>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: 'var(--cyber-cyan)',
                        boxShadow: '0 0 6px var(--cyber-cyan)',
                      }}
                    />
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(0, 217, 255, 0.15)' }}>
        {/* Theme Toggle */}
        {onToggleTheme && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all mb-2"
            style={{
              background: 'rgba(0, 217, 255, 0.06)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              color: 'var(--cyber-cyan)',
            }}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              {isDarkMode ? <Moon size={19} /> : <Sun size={19} />}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 flex items-center justify-between overflow-hidden"
                >
                  <span className="text-sm whitespace-nowrap" style={{ color: 'var(--cyber-white)' }}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  {/* Toggle pill */}
                  <div
                    className="relative w-10 h-5 rounded-full flex-shrink-0"
                    style={{ background: isDarkMode ? 'var(--cyber-cyan)' : 'rgba(0,217,255,0.25)' }}
                  >
                    <motion.div
                      animate={{ x: isDarkMode ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full"
                      style={{ background: isDarkMode ? 'var(--cyber-navy)' : 'var(--cyber-cyan)' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
          }}
        >
          <LogOut size={19} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-24 w-7 h-7 rounded-full flex items-center justify-center z-10"
        style={{
          background: 'var(--cyber-teal)',
          border: '2px solid var(--cyber-navy)',
          color: 'var(--cyber-white)',
          boxShadow: '0 0 12px rgba(0,217,255,0.4)',
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </motion.button>
    </motion.div>
  );
}