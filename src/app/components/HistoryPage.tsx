import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Calendar,
  FileText,
  MessageSquare,
  Search,
  Trash2,
  ChevronDown,
  Play,
  Clock,
  Hash,
  Upload,
  Lock,
  MessagesSquare,
  ArrowRight,
} from 'lucide-react';
import { ChatHistoryItem } from '../App';

interface HistoryPageProps {
  history: ChatHistoryItem[];
  onDeleteHistory: (id: string) => void;
  onNavigateToChat?: (question: string) => void;
  hasDocuments: boolean;
  onNavigateToUpload?: () => void;
}

type DateFilter = 'all' | 'today' | 'week' | 'older';

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This Week';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(items: ChatHistoryItem[]): Record<string, ChatHistoryItem[]> {
  const groups: Record<string, ChatHistoryItem[]> = {};
  items.forEach((item) => {
    const label = getDateLabel(item.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
}

export function HistoryPage({
  history,
  onDeleteHistory,
  onNavigateToChat,
  hasDocuments,
  onNavigateToUpload,
}: HistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filterLabels: Record<DateFilter, string> = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    older: 'Older',
  };

  const hasHistory = history.length > 0;

  const filtered = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);

    return history.filter((item) => {
      const itemDate = new Date(item.timestamp);
      if (dateFilter === 'today' && itemDate < todayStart) return false;
      if (dateFilter === 'week' && itemDate < weekStart) return false;
      if (dateFilter === 'older' && itemDate >= weekStart) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.chatTitle.toLowerCase().includes(q) ||
          item.documentName.toLowerCase().includes(q) ||
          item.lastMessagePreview.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [history, searchQuery, dateFilter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDeleteHistory(id);
      setDeletingId(null);
    }, 300);
  };

  // ─── STATE 1: No document uploaded ───────────────────────────────────────────
  if (!hasDocuments) {
    return (
      <div className="h-full flex flex-col">
        {/* Muted Header */}
        <div
          className="px-6 py-4 border-b flex-shrink-0"
          style={{
            background: 'rgba(13, 115, 119, 0.03)',
            borderColor: 'rgba(0, 217, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(0,217,255,0.05)',
                border: '1px solid rgba(0,217,255,0.12)',
              }}
            >
              <History size={16} style={{ color: 'var(--cyber-cyan)', opacity: 0.4 }} />
            </div>
            <div>
              <h2 style={{ color: 'var(--cyber-aqua)', opacity: 0.45 }}>Chat History</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cyber-white)', opacity: 0.3 }}>
                Locked until document is uploaded
              </p>
            </div>
            {/* Lock badge */}
            <div
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(232,244,248,0.3)',
              }}
            >
              <Lock size={11} />
              <span>Locked</span>
            </div>
          </div>
        </div>

        {/* Locked Body */}
        <div
          className="flex-1 flex items-center justify-center p-8"
          style={{ opacity: 0.85 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-sm w-full"
          >
            {/* Icon cluster */}
            <div className="relative mx-auto mb-7 w-28 h-28">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px dashed rgba(0,217,255,0.15)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              />
              {/* Inner circle */}
              <div
                className="absolute inset-3 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,217,255,0.04)',
                  border: '1px solid rgba(0,217,255,0.12)',
                }}
              >
                <History size={34} style={{ color: 'var(--cyber-cyan)', opacity: 0.25 }} />
              </div>
              {/* Lock overlay */}
              <div
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--cyber-navy-light)',
                  border: '2px solid rgba(0,217,255,0.15)',
                }}
              >
                <Lock size={15} style={{ color: 'rgba(232,244,248,0.3)' }} />
              </div>
            </div>

            {/* Text */}
            <h3
              className="mb-2"
              style={{ color: 'var(--cyber-white)', opacity: 0.7 }}
            >
              No history yet.
            </h3>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: 'var(--cyber-white)', opacity: 0.4 }}
            >
              Upload a document and start chatting to see your activity here.
            </p>

            {/* Step indicators */}
            <div
              className="flex items-center justify-center gap-2 mb-7 text-xs"
              style={{ color: 'rgba(232,244,248,0.3)' }}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(0,217,255,0.05)',
                  border: '1px solid rgba(0,217,255,0.1)',
                }}
              >
                <Upload size={11} />
                <span>Upload</span>
              </div>
              <ArrowRight size={12} style={{ opacity: 0.3 }} />
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(0,217,255,0.03)',
                  border: '1px solid rgba(0,217,255,0.07)',
                }}
              >
                <MessageSquare size={11} />
                <span>Chat</span>
              </div>
              <ArrowRight size={12} style={{ opacity: 0.3 }} />
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(0,217,255,0.03)',
                  border: '1px solid rgba(0,217,255,0.07)',
                }}
              >
                <History size={11} />
                <span>History</span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: '0 0 28px rgba(0,217,255,0.35)',
              }}
              whileTap={{ scale: 0.97 }}
              onClick={onNavigateToUpload}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--cyber-teal), var(--cyber-cyan))',
                color: 'var(--cyber-navy)',
                boxShadow: '0 0 18px rgba(0,217,255,0.25)',
              }}
            >
              <Upload size={16} />
              <span>Upload Document</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── STATE 2: Document uploaded, no chats yet ─────────────────────────────────
  if (!hasHistory) {
    return (
      <div className="h-full flex flex-col">
        {/* Active Header (no search controls yet) */}
        <div
          className="px-6 py-4 border-b flex-shrink-0"
          style={{
            background: 'rgba(13, 115, 119, 0.05)',
            borderColor: 'rgba(0, 217, 255, 0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(0,217,255,0.1)',
                border: '1px solid rgba(0,217,255,0.3)',
              }}
            >
              <History size={16} style={{ color: 'var(--cyber-cyan)' }} />
            </div>
            <div>
              <h2 style={{ color: 'var(--cyber-aqua)' }}>Chat History</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cyber-white)', opacity: 0.5 }}>
                Ready · Conversations will appear here
              </p>
            </div>
            <div
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#10b981', boxShadow: '0 0 5px #10b981' }}
              />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* No-chat-yet body */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-sm w-full"
          >
            {/* Animated icon */}
            <div className="relative mx-auto mb-7 w-28 h-28">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(0,217,255,0.15)' }}
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(0,217,255,0)',
                    '0 0 20px rgba(0,217,255,0.15)',
                    '0 0 0px rgba(0,217,255,0)',
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <div
                className="absolute inset-3 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,217,255,0.06)',
                  border: '1px solid rgba(0,217,255,0.2)',
                }}
              >
                <MessagesSquare size={34} style={{ color: 'var(--cyber-cyan)', opacity: 0.55 }} />
              </div>
              {/* Pulse dot */}
              <motion.div
                className="absolute top-2 right-2 w-4 h-4 rounded-full"
                style={{
                  background: 'rgba(16,185,129,0.2)',
                  border: '1.5px solid #10b981',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Text */}
            <h3 className="mb-2" style={{ color: 'var(--cyber-white)' }}>
              No conversations yet.
            </h3>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: 'var(--cyber-white)', opacity: 0.45 }}
            >
              Your chat history will appear here automatically after you send your first message.
            </p>

            {/* Info strip */}
            <div
              className="flex items-start gap-3 p-4 rounded-2xl mb-7 text-left"
              style={{
                background: 'rgba(0,217,255,0.04)',
                border: '1px solid rgba(0,217,255,0.14)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: 'rgba(0,217,255,0.1)',
                  border: '1px solid rgba(0,217,255,0.25)',
                }}
              >
                <FileText size={15} style={{ color: 'var(--cyber-cyan)' }} />
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--cyber-cyan)' }}>
                  Document ready
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--cyber-white)', opacity: 0.45 }}>
                  Your document is indexed. Head to chat and ask your first question — it will be logged here automatically.
                </p>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: '0 0 28px rgba(0,217,255,0.3)',
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateToChat?.('')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--cyber-teal), var(--cyber-cyan))',
                color: 'var(--cyber-navy)',
                boxShadow: '0 0 18px rgba(0,217,255,0.2)',
              }}
            >
              <MessageSquare size={16} />
              <span>Start your first chat</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── STATE 3: Has history — full list view ────────────────────────────────────
  return (
    <div className="h-full flex flex-col">
      {/* Full Header with search + filter */}
      <div
        className="px-6 py-4 border-b flex-shrink-0"
        style={{
          background: 'rgba(13, 115, 119, 0.05)',
          borderColor: 'rgba(0, 217, 255, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ color: 'var(--cyber-aqua)' }}>Chat History</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--cyber-white)', opacity: 0.55 }}>
              {history.length} conversation{history.length !== 1 ? 's' : ''} · Newest first
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: 'rgba(0,217,255,0.1)',
              border: '1px solid rgba(0,217,255,0.3)',
              color: 'var(--cyber-cyan)',
            }}
          >
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, document or content…"
              className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm"
              style={{
                background: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                color: 'var(--cyber-white)',
              }}
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap"
              style={{
                background: 'rgba(0,217,255,0.08)',
                border: '1px solid rgba(0,217,255,0.25)',
                color: 'var(--cyber-cyan)',
              }}
            >
              <Calendar size={15} />
              <span>{filterLabels[dateFilter]}</span>
              <ChevronDown
                size={14}
                style={{
                  transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </motion.button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-20"
                  style={{
                    background: 'var(--cyber-navy)',
                    border: '1px solid rgba(0,217,255,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                  }}
                >
                  {(Object.keys(filterLabels) as DateFilter[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setDateFilter(key);
                        setFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{
                        color: dateFilter === key ? 'var(--cyber-cyan)' : 'var(--cyber-white)',
                        background:
                          dateFilter === key ? 'rgba(0,217,255,0.08)' : 'transparent',
                      }}
                    >
                      {filterLabels[key]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* History List */}
      <div
        className="flex-1 overflow-y-auto p-6 cyber-scrollbar"
        onClick={() => setFilterOpen(false)}
      >
        {filtered.length === 0 ? (
          /* Search / filter returned nothing */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-16"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(0,217,255,0.06)',
                border: '1px solid rgba(0,217,255,0.15)',
              }}
            >
              <Search size={24} style={{ color: 'var(--cyber-cyan)', opacity: 0.4 }} />
            </div>
            <h3 className="mb-2" style={{ color: 'var(--cyber-white)' }}>
              No results found
            </h3>
            <p
              className="text-sm max-w-xs"
              style={{ color: 'var(--cyber-white)', opacity: 0.45 }}
            >
              {searchQuery
                ? `Nothing matches "${searchQuery}". Try a different search term.`
                : 'No conversations match the selected time filter.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSearchQuery('');
                setDateFilter('all');
              }}
              className="mt-5 px-5 py-2 rounded-xl text-sm"
              style={{
                background: 'rgba(0,217,255,0.08)',
                border: '1px solid rgba(0,217,255,0.25)',
                color: 'var(--cyber-cyan)',
              }}
            >
              Clear filters
            </motion.button>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {/* Date Group Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-xs flex-shrink-0"
                    style={{
                      background: 'rgba(0,217,255,0.08)',
                      border: '1px solid rgba(0,217,255,0.2)',
                      color: 'var(--cyber-aqua)',
                    }}
                  >
                    <Calendar size={12} />
                    <span>{dateLabel}</span>
                  </div>
                  <div
                    className="flex-1 h-px"
                    style={{ background: 'rgba(0,217,255,0.12)' }}
                  />
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: 'var(--cyber-white)', opacity: 0.35 }}
                  >
                    {items.length} chat{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Chat Entry Cards */}
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -24, y: -4 }}
                        animate={{
                          opacity: deletingId === item.id ? 0 : 1,
                          x: deletingId === item.id ? 40 : 0,
                          scale: deletingId === item.id ? 0.95 : 1,
                          y: 0,
                        }}
                        exit={{ opacity: 0, x: 40, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="rounded-2xl p-4 group relative overflow-hidden cursor-default"
                        style={{
                          background: 'rgba(13, 115, 119, 0.05)',
                          border: '1px solid rgba(0, 217, 255, 0.14)',
                        }}
                      >
                        {/* Hover glow */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                          style={{
                            background:
                              'radial-gradient(ellipse at 20% 50%, rgba(0,217,255,0.05), transparent 65%)',
                          }}
                        />
                        {/* Left accent bar */}
                        <div
                          className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--cyber-cyan)' }}
                        />

                        <div className="relative flex gap-4">
                          {/* Icon */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: 'rgba(0, 217, 255, 0.09)',
                              border: '1px solid rgba(0,217,255,0.25)',
                            }}
                          >
                            <MessageSquare size={18} style={{ color: 'var(--cyber-cyan)' }} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title + actions */}
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <h4
                                className="text-sm leading-snug"
                                style={{ color: 'var(--cyber-white)' }}
                              >
                                {item.chatTitle}
                              </h4>
                              {/* Hover actions */}
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <motion.button
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onNavigateToChat?.(item.chatTitle)}
                                  title="Continue in chat"
                                  className="p-1.5 rounded-lg"
                                  style={{
                                    background: 'rgba(0,217,255,0.1)',
                                    color: 'var(--cyber-cyan)',
                                  }}
                                >
                                  <Play size={13} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(item.id)}
                                  title="Delete entry"
                                  className="p-1.5 rounded-lg"
                                  style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#f87171',
                                  }}
                                >
                                  <Trash2 size={13} />
                                </motion.button>
                              </div>
                            </div>

                            {/* Document */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <FileText
                                size={11}
                                style={{ color: 'var(--cyber-cyan)', opacity: 0.65 }}
                              />
                              <span
                                className="text-xs truncate"
                                style={{ color: 'var(--cyber-cyan)', opacity: 0.65 }}
                              >
                                {item.documentName}
                              </span>
                            </div>

                            {/* Preview */}
                            <p
                              className="text-xs leading-relaxed mb-3 line-clamp-2"
                              style={{ color: 'var(--cyber-white)', opacity: 0.5 }}
                            >
                              {item.lastMessagePreview}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center gap-4">
                              <div
                                className="flex items-center gap-1 text-xs"
                                style={{ color: 'var(--cyber-white)', opacity: 0.38 }}
                              >
                                <Clock size={11} />
                                <span>
                                  {new Date(item.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div
                                className="flex items-center gap-1 text-xs"
                                style={{ color: 'var(--cyber-white)', opacity: 0.38 }}
                              >
                                <Hash size={11} />
                                <span>{item.messageCount} message{item.messageCount !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
