import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  CheckCheck,
  FileText,
  AlertCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface TopHeaderProps {
  userName: string;
  userEmail?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleMobileSidebar?: () => void;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  upload: 'Upload Document',
  chat: 'Chat & Q&A',
  faq: 'FAQ / Suggestions',
  saved: 'Saved Queries',
  history: 'History',
  settings: 'Settings',
};

export function TopHeader({
  userName,
  userEmail,
  currentPage,
  onNavigate,
  onLogout,
  onToggleMobileSidebar,
}: TopHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'success' as const,
      title: 'Document processed successfully',
      message: 'Your document "Report.pdf" is ready for analysis',
      time: '5 min ago',
      read: false,
    },
    {
      id: 2,
      type: 'info' as const,
      title: 'New feature available',
      message: 'Try our enhanced table extraction feature',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'warning' as const,
      title: 'Storage limit warning',
      message: 'You have used 80% of your storage quota',
      time: '1 day ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mock search data
  const recentSearches = [
    'Financial Report Q4 2024',
    'Project Timeline',
    'Budget Analysis',
  ];

  const popularSearches = [
    'Upload document',
    'Chat history',
    'Settings',
  ];

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with "/" key
      if (e.key === '/' && !searchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Close search with Escape
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : 'User';

  const initials = userName
    ? userName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div
      className="flex items-center justify-between px-6 py-3 flex-shrink-0 relative z-30"
      style={{
        background: 'rgba(10, 15, 30, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 243, 255, 0.1)',
      }}
    >
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onToggleMobileSidebar && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl"
            style={{
              background: 'rgba(0, 243, 255, 0.06)',
              border: '1px solid rgba(0, 243, 255, 0.15)',
              color: '#00F3FF',
            }}
          >
            <Menu size={20} />
          </motion.button>
        )}

        {/* Page title with breadcrumb */}
        <div className="flex items-center gap-2">
          <div
            className="hidden sm:block w-1.5 h-1.5 rounded-full"
            style={{ background: '#00F3FF', boxShadow: '0 0 8px #00F3FF' }}
          />
          <h2
            className="text-sm sm:text-base"
            style={{ color: '#E8F4F8', opacity: 0.9 }}
          >
            {pageTitles[currentPage] || 'Dashboard'}
          </h2>
        </div>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button (desktop) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSearchOpen(!searchOpen)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{
            background: 'rgba(0, 243, 255, 0.04)',
            border: '1px solid rgba(0, 243, 255, 0.12)',
            color: 'rgba(232, 244, 248, 0.4)',
          }}
        >
          <Search size={14} />
          <span className="hidden md:inline">Search...</span>
          <kbd
            className="hidden md:inline px-1.5 py-0.5 rounded text-xs"
            style={{
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid rgba(0, 243, 255, 0.15)',
              color: 'rgba(232, 244, 248, 0.3)',
              fontSize: '10px',
            }}
          >
            /
          </kbd>
        </motion.button>

        {/* Search input (desktop) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 w-96 rounded-2xl overflow-hidden z-50"
              style={{
                background: 'rgba(10, 15, 30, 0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                boxShadow:
                  '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 243, 255, 0.08)',
              }}
            >
              {/* Header with search input */}
              <div
                className="px-4 py-3 border-b"
                style={{
                  borderColor: 'rgba(0, 243, 255, 0.1)',
                  background: 'rgba(0, 243, 255, 0.03)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Search size={16} style={{ color: '#00F3FF', opacity: 0.6 }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search documents, chats, settings..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: '#E8F4F8' }}
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    style={{ color: '#00F3FF', opacity: 0.6 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Recent Searches */}
              <div className="py-2">
                <div
                  className="px-4 py-1.5 text-xs font-semibold"
                  style={{ color: '#00F3FF', opacity: 0.5 }}
                >
                  RECENT SEARCHES
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                    style={{ color: '#E8F4F8' }}
                  >
                    <Clock size={14} style={{ opacity: 0.4 }} />
                    <span className="text-sm flex-1 text-left truncate">{search}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: 'rgba(0, 243, 255, 0.1)' }}
              />

              {/* Popular Searches */}
              <div className="py-2">
                <div
                  className="px-4 py-1.5 text-xs font-semibold"
                  style={{ color: '#00F3FF', opacity: 0.5 }}
                >
                  POPULAR SEARCHES
                </div>
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                    style={{ color: '#E8F4F8' }}
                  >
                    <TrendingUp size={14} style={{ opacity: 0.4 }} />
                    <span className="text-sm flex-1 text-left truncate">{search}</span>
                  </button>
                ))}
              </div>

              {/* Footer with keyboard shortcut hint */}
              <div
                className="px-4 py-2.5 border-t text-xs text-center"
                style={{
                  borderColor: 'rgba(0, 243, 255, 0.1)',
                  background: 'rgba(0, 243, 255, 0.02)',
                  color: '#00F3FF',
                  opacity: 0.5,
                }}
              >
                Press <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(0, 243, 255, 0.1)' }}>ESC</kbd> to close
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-xl"
            style={{
              background: 'rgba(0, 243, 255, 0.04)',
              border: '1px solid rgba(0, 243, 255, 0.12)',
              color: 'rgba(232, 244, 248, 0.6)',
            }}
          >
            <Bell size={17} />
            {/* Notification dot */}
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
              />
            )}
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'rgba(10, 15, 30, 0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  boxShadow:
                    '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 243, 255, 0.08)',
                }}
              >
                {/* Header */}
                <div
                  className="px-4 py-3 border-b"
                  style={{
                    borderColor: 'rgba(0, 243, 255, 0.1)',
                    background: 'rgba(0, 243, 255, 0.03)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold" style={{ color: '#E8F4F8' }}>
                      Notifications
                    </div>
                    <button
                      className="text-sm"
                      style={{ color: '#00F3FF', opacity: 0.6 }}
                      onClick={() => setNotificationOpen(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notifications list */}
                <div className="py-1.5">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className="px-4 py-2.5 border-b"
                      style={{
                        borderColor: 'rgba(0, 243, 255, 0.1)',
                        background: n.read ? 'rgba(0, 243, 255, 0.03)' : 'rgba(0, 243, 255, 0.05)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {n.type === 'success' && <CheckCheck size={16} style={{ color: '#10b981' }} />}
                        {n.type === 'info' && <FileText size={16} style={{ color: '#00F3FF' }} />}
                        {n.type === 'warning' && <AlertCircle size={16} style={{ color: '#f87171' }} />}
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-sm truncate"
                            style={{ color: '#E8F4F8' }}
                          >
                            {n.title}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: '#00F3FF', opacity: 0.6 }}
                          >
                            {n.message}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: '#00F3FF', opacity: 0.4 }}
                          >
                            {n.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="border-t py-1.5"
                  style={{ borderColor: 'rgba(0, 243, 255, 0.1)' }}
                >
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: '#E8F4F8' }}
                  >
                    <FileText size={16} style={{ opacity: 0.6 }} />
                    <span>View All</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-8"
          style={{ background: 'rgba(0, 243, 255, 0.12)' }}
        />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: profileOpen
                ? 'rgba(0, 243, 255, 0.1)'
                : 'rgba(0, 243, 255, 0.04)',
              border: `1px solid ${
                profileOpen
                  ? 'rgba(0, 243, 255, 0.3)'
                  : 'rgba(0, 243, 255, 0.1)'
              }`,
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0d7377, #00F3FF)',
                boxShadow: '0 0 12px rgba(0, 243, 255, 0.3)',
              }}
            >
              <span
                className="text-xs"
                style={{ color: '#0A0F1E', fontWeight: 700 }}
              >
                {initials}
              </span>
            </div>
            {/* Name (desktop only) */}
            <div className="hidden sm:block text-left min-w-0">
              <div
                className="text-sm truncate max-w-[120px]"
                style={{ color: '#E8F4F8' }}
              >
                {displayName}
              </div>
            </div>
            <ChevronDown
              size={14}
              className="hidden sm:block"
              style={{
                color: '#00F3FF',
                opacity: 0.6,
                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'rgba(10, 15, 30, 0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  boxShadow:
                    '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 243, 255, 0.08)',
                }}
              >
                {/* User info */}
                <div
                  className="px-4 py-3 border-b"
                  style={{
                    borderColor: 'rgba(0, 243, 255, 0.1)',
                    background: 'rgba(0, 243, 255, 0.03)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #0d7377, #00F3FF)',
                        boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)',
                      }}
                    >
                      <span
                        className="text-sm"
                        style={{ color: '#0A0F1E', fontWeight: 700 }}
                      >
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm truncate"
                        style={{ color: '#E8F4F8' }}
                      >
                        {displayName}
                      </div>
                      {userEmail && (
                        <div
                          className="text-xs truncate"
                          style={{ color: '#00F3FF', opacity: 0.6 }}
                        >
                          {userEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: '#E8F4F8' }}
                  >
                    <User size={16} style={{ opacity: 0.6 }} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: '#E8F4F8' }}
                  >
                    <Settings size={16} style={{ opacity: 0.6 }} />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div
                  className="border-t py-1.5"
                  style={{ borderColor: 'rgba(0, 243, 255, 0.1)' }}
                >
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-500/10 transition-colors"
                    style={{ color: '#f87171' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}