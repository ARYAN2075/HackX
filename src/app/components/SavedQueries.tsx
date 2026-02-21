import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark,
  Trash2,
  Search,
  Clock,
  FileText,
  Play,
  MessageSquare,
  LayoutGrid,
  List,
} from 'lucide-react';
import { SavedQueryItem } from '../App';

interface SavedQueriesProps {
  queries: SavedQueryItem[];
  onDeleteQuery: (id: string) => void;
  onRerunQuery: (queryText: string) => void;
}

export function SavedQueries({ queries, onDeleteQuery, onRerunQuery }: SavedQueriesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return queries;
    const q = searchQuery.toLowerCase();
    return queries.filter(
      (item) =>
        item.queryText.toLowerCase().includes(q) ||
        item.documentName.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [queries, searchQuery]);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDeleteQuery(id);
      setDeletingId(null);
    }, 300);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex-shrink-0"
        style={{
          background: 'rgba(13, 115, 119, 0.05)',
          borderColor: 'rgba(0, 217, 255, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ color: 'var(--cyber-aqua)' }}>Saved Queries</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--cyber-white)', opacity: 0.55 }}>
              {queries.length} saved · Click{' '}
              <span style={{ color: 'var(--cyber-cyan)' }}>Re-run</span> to send again
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Layout toggle */}
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(0,217,255,0.2)' }}
            >
              {(['list', 'grid'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className="p-2 transition-colors"
                  style={{
                    background: layout === l ? 'rgba(0,217,255,0.15)' : 'transparent',
                    color: layout === l ? 'var(--cyber-cyan)' : 'rgba(232,244,248,0.4)',
                  }}
                >
                  {l === 'list' ? <List size={16} /> : <LayoutGrid size={16} />}
                </button>
              ))}
            </div>
            {/* Count badge */}
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
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={16}
            style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved queries or documents…"
            className="w-full rounded-xl pl-11 pr-4 py-3 outline-none text-sm"
            style={{
              background: 'rgba(0, 217, 255, 0.05)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              color: 'var(--cyber-white)',
            }}
          />
        </div>
      </div>

      {/* Queries Content */}
      <div className="flex-1 overflow-y-auto p-6 cyber-scrollbar">
        {filtered.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-16"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(0,217,255,0.08)',
                  '0 0 40px rgba(0,217,255,0.2)',
                  '0 0 20px rgba(0,217,255,0.08)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'rgba(0,217,255,0.06)',
                border: '2px solid rgba(0,217,255,0.2)',
              }}
            >
              <Bookmark size={38} style={{ color: 'var(--cyber-cyan)', opacity: 0.5 }} />
            </motion.div>
            <h3 className="mb-2" style={{ color: 'var(--cyber-white)' }}>
              {searchQuery ? 'No results found' : 'No saved queries yet'}
            </h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--cyber-white)', opacity: 0.5 }}>
              {searchQuery
                ? `Nothing matches "${searchQuery}". Try a different search.`
                : 'Save queries from the chat panel by clicking the bookmark icon on AI responses.'}
            </p>
            {!searchQuery && (
              <div
                className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{
                  background: 'rgba(0,217,255,0.06)',
                  border: '1px solid rgba(0,217,255,0.2)',
                  color: 'var(--cyber-cyan)',
                }}
              >
                <MessageSquare size={15} />
                <span>Go to Chat to save queries</span>
              </div>
            )}
          </motion.div>
        ) : layout === 'list' ? (
          /* List Layout */
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((query, index) => (
                <motion.div
                  key={query.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: deletingId === query.id ? 0 : 1,
                    y: 0,
                    scale: deletingId === query.id ? 0.95 : 1,
                    x: deletingId === query.id ? 40 : 0,
                  }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                  className="rounded-2xl p-5 group relative overflow-hidden"
                  style={{
                    background: 'rgba(13, 115, 119, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.18)',
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle at 15% 50%, rgba(0,217,255,0.04), transparent 60%)',
                    }}
                  />

                  <div className="relative flex gap-4">
                    {/* Bookmark icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: 'rgba(251,191,36,0.12)',
                        border: '1px solid rgba(251,191,36,0.3)',
                      }}
                    >
                      <Bookmark size={18} style={{ color: '#fbbf24' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Query text */}
                      <p
                        className="text-sm mb-2 line-clamp-2 leading-relaxed"
                        style={{ color: 'var(--cyber-white)' }}
                      >
                        {query.queryText}
                      </p>

                      {/* Answer preview */}
                      <p
                        className="text-xs mb-3 line-clamp-2 leading-relaxed"
                        style={{ color: 'var(--cyber-white)', opacity: 0.5 }}
                      >
                        {query.answer}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                        {/* Document name */}
                        <div className="flex items-center gap-1.5">
                          <FileText size={12} style={{ color: 'var(--cyber-cyan)', opacity: 0.7 }} />
                          <span
                            className="text-xs truncate max-w-[160px]"
                            style={{ color: 'var(--cyber-cyan)', opacity: 0.7 }}
                          >
                            {query.documentName}
                          </span>
                        </div>
                        {/* Save date */}
                        <div
                          className="flex items-center gap-1 text-xs"
                          style={{ color: 'var(--cyber-white)', opacity: 0.38 }}
                        >
                          <Clock size={11} />
                          <span>
                            {new Date(query.savedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Re-run button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onRerunQuery(query.queryText)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                        style={{
                          background: 'rgba(0,217,255,0.12)',
                          border: '1px solid rgba(0,217,255,0.35)',
                          color: 'var(--cyber-cyan)',
                        }}
                        title="Re-run in chat"
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Re-run</span>
                      </motion.button>
                      {/* Delete button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(query.id)}
                        className="p-1.5 rounded-lg self-end"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          color: '#f87171',
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Grid Layout */
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((query, index) => (
                <motion.div
                  key={query.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: deletingId === query.id ? 0 : 1,
                    scale: deletingId === query.id ? 0.9 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                  className="rounded-2xl p-4 group relative overflow-hidden flex flex-col"
                  style={{
                    background: 'rgba(13, 115, 119, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.18)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(251,191,36,0.12)',
                        border: '1px solid rgba(251,191,36,0.3)',
                      }}
                    >
                      <Bookmark size={15} style={{ color: '#fbbf24' }} />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(query.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                    >
                      <Trash2 size={13} />
                    </motion.button>
                  </div>

                  {/* Query text */}
                  <p
                    className="text-sm mb-2 line-clamp-2 flex-1"
                    style={{ color: 'var(--cyber-white)' }}
                  >
                    {query.queryText}
                  </p>

                  {/* Document */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <FileText size={11} style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }} />
                    <span
                      className="text-xs truncate"
                      style={{ color: 'var(--cyber-cyan)', opacity: 0.6 }}
                    >
                      {query.documentName}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--cyber-white)', opacity: 0.35 }}>
                      {new Date(query.savedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRerunQuery(query.queryText)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs"
                      style={{
                        background: 'rgba(0,217,255,0.12)',
                        border: '1px solid rgba(0,217,255,0.35)',
                        color: 'var(--cyber-cyan)',
                      }}
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Re-run</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
