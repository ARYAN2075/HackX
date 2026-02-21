import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, TrendingUp, Upload, Brain, BookOpen, ChevronRight, Zap, Search, ArrowUpRight } from 'lucide-react';

interface FAQSuggestionsProps {
  onSelectQuestion?: (question: string) => void;
  hasDocuments: boolean;
}

const generalFaqs = [
  {
    category: 'Quick Start',
    icon: Sparkles,
    color: '#00F3FF',
    glowColor: 'rgba(0, 243, 255, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(0,243,255,0.07) 0%, rgba(13,115,119,0.12) 100%)',
    questions: [
      { q: 'How do I upload a document?', tag: 'Beginner' },
      { q: 'What file formats are supported?', tag: 'Info' },
      { q: 'How can I search within my documents?', tag: 'Feature' },
      { q: 'Can I upload multiple documents at once?', tag: 'Feature' },
    ],
  },
  {
    category: 'AI Features',
    icon: Brain,
    color: '#38EFF0',
    glowColor: 'rgba(56, 239, 240, 0.18)',
    gradient: 'linear-gradient(135deg, rgba(56,239,240,0.06) 0%, rgba(13,115,119,0.1) 100%)',
    questions: [
      { q: 'How does the AI analyze documents?', tag: 'AI' },
      { q: 'What languages are supported?', tag: 'Info' },
      { q: 'Can the AI summarize long documents?', tag: 'Feature' },
      { q: 'How accurate are the AI responses?', tag: 'Quality' },
    ],
  },
  {
    category: 'Document Management',
    icon: HelpCircle,
    color: '#14a1a8',
    glowColor: 'rgba(20, 161, 168, 0.18)',
    gradient: 'linear-gradient(135deg, rgba(20,161,168,0.07) 0%, rgba(13,115,119,0.1) 100%)',
    questions: [
      { q: 'Where are my documents stored?', tag: 'Privacy' },
      { q: 'How do I delete a document?', tag: 'Manage' },
      { q: 'Can I share documents with others?', tag: 'Sharing' },
      { q: 'Is there a file size limit?', tag: 'Limits' },
    ],
  },
];

const documentFaqs = [
  {
    category: 'Document Analysis',
    icon: Brain,
    color: '#00F3FF',
    glowColor: 'rgba(0, 243, 255, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(0,243,255,0.07) 0%, rgba(13,115,119,0.12) 100%)',
    questions: [
      { q: 'What is the main topic of this document?', tag: 'Overview' },
      { q: 'Summarize the key findings in 3 points', tag: 'Summary' },
      { q: 'What are the main conclusions?', tag: 'Analysis' },
      { q: 'List all the recommendations made', tag: 'Action' },
    ],
  },
  {
    category: 'Content Exploration',
    icon: BookOpen,
    color: '#38EFF0',
    glowColor: 'rgba(56, 239, 240, 0.18)',
    gradient: 'linear-gradient(135deg, rgba(56,239,240,0.06) 0%, rgba(13,115,119,0.1) 100%)',
    questions: [
      { q: 'What methodology was used?', tag: 'Method' },
      { q: 'What data sources are referenced?', tag: 'Sources' },
      { q: 'Are there any charts or figures described?', tag: 'Visual' },
      { q: 'What is the target audience of this document?', tag: 'Context' },
    ],
  },
  {
    category: 'Deep Insights',
    icon: Sparkles,
    color: '#14a1a8',
    glowColor: 'rgba(20, 161, 168, 0.18)',
    gradient: 'linear-gradient(135deg, rgba(20,161,168,0.07) 0%, rgba(13,115,119,0.1) 100%)',
    questions: [
      { q: 'What are the limitations mentioned?', tag: 'Critical' },
      { q: 'Explain the technical terms used', tag: 'Glossary' },
      { q: 'What future work is suggested?', tag: 'Future' },
      { q: 'Compare the introduction and conclusion', tag: 'Compare' },
    ],
  },
];

const tagColors: Record<string, string> = {
  Beginner: '#10b981',
  Info: '#00F3FF',
  Feature: '#38EFF0',
  AI: '#a78bfa',
  Quality: '#fbbf24',
  Privacy: '#f87171',
  Manage: '#00F3FF',
  Sharing: '#38EFF0',
  Limits: '#fbbf24',
  Overview: '#00F3FF',
  Summary: '#38EFF0',
  Analysis: '#a78bfa',
  Action: '#10b981',
  Method: '#14a1a8',
  Sources: '#00F3FF',
  Visual: '#38EFF0',
  Context: '#fbbf24',
  Critical: '#f87171',
  Glossary: '#00F3FF',
  Future: '#38EFF0',
  Compare: '#a78bfa',
};

export function FAQSuggestions({ onSelectQuestion, hasDocuments }: FAQSuggestionsProps) {
  const faqs = hasDocuments ? documentFaqs : generalFaqs;
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredQ, setHoveredQ] = useState<string | null>(null);

  const filteredFaqs = faqs.map((cat) => ({
    ...cat,
    questions: cat.questions.filter((q) =>
      !searchQuery || q.q.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--cyber-navy-dark)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b flex-shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(13,115,119,0.1) 0%, rgba(0,243,255,0.04) 100%)',
          borderColor: 'rgba(0, 243, 255, 0.15)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,243,255,1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,243,255,0.12)', border: '1px solid rgba(0,243,255,0.3)' }}
              >
                <HelpCircle size={18} style={{ color: '#00F3FF' }} />
              </div>
              <h2 style={{ color: '#38EFF0' }}>
                {hasDocuments ? 'AI Query Suggestions' : 'FAQ & Help Center'}
              </h2>
            </div>
            {hasDocuments && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,243,255,0.1)', border: '1px solid rgba(0,243,255,0.3)' }}
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={11} style={{ color: '#00F3FF' }} />
                </motion.div>
                <span className="text-xs" style={{ color: '#00F3FF' }}>AI Generated</span>
              </motion.div>
            )}
          </div>
          <p className="text-sm ml-12" style={{ color: '#E8F4F8', opacity: 0.5 }}>
            {hasDocuments
              ? 'Smart queries generated from your document. Click any to send to chat.'
              : 'Browse common questions and how-to guides'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(0,243,255,0.1)' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#00F3FF', opacity: 0.55 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions…"
            className="w-full rounded-xl pl-11 pr-4 py-3 outline-none text-sm"
            style={{
              background: 'rgba(0,243,255,0.05)',
              border: '1px solid rgba(0,243,255,0.2)',
              color: '#E8F4F8',
            }}
          />
        </div>
      </div>

      {/* No doc banner */}
      {!hasDocuments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-6 mt-4 rounded-2xl p-4 flex items-center gap-3 flex-shrink-0"
          style={{ background: 'rgba(0,243,255,0.05)', border: '1px solid rgba(0,243,255,0.2)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,243,255,0.12)', border: '1px solid rgba(0,243,255,0.3)' }}
          >
            <Upload size={18} style={{ color: '#00F3FF' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: '#E8F4F8' }}>Upload a document for AI-powered query suggestions</p>
            <p className="text-xs" style={{ color: '#E8F4F8', opacity: 0.45 }}>Smart questions will be generated specifically for your document</p>
          </div>
        </motion.div>
      )}

      {/* FAQ Categories — 3D Layered Cards */}
      <div className="flex-1 overflow-y-auto p-6 cyber-scrollbar">
        <div className="max-w-4xl mx-auto space-y-5">
          <AnimatePresence>
            {filteredFaqs.map((category, catIdx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: catIdx * 0.1, type: 'spring', stiffness: 200 }}
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: category.gradient,
                  border: `1px solid ${category.color}25`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${category.color}08`,
                }}
              >
                {/* 3D depth shadow layer */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 60% 40% at 80% 10%, ${category.color}10, transparent 60%)`,
                  }}
                />
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{ background: `linear-gradient(180deg, transparent, ${category.color}80, transparent)` }}
                />

                {/* Header */}
                <div className="px-6 pt-5 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${category.color}14`,
                        border: `1px solid ${category.color}40`,
                        boxShadow: `0 0 20px ${category.glowColor}`,
                      }}
                    >
                      <category.icon size={20} style={{ color: category.color }} />
                    </motion.div>
                    <div>
                      <h3 style={{ color: '#E8F4F8' }}>{category.category}</h3>
                      <p className="text-xs" style={{ color: category.color, opacity: 0.75 }}>
                        {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${category.color}10`, border: `1px solid ${category.color}25` }}
                  >
                    <Zap size={13} style={{ color: category.color, opacity: 0.7 }} />
                  </div>
                </div>

                {/* Question Grid */}
                <div className="px-5 pb-5 grid gap-2">
                  {category.questions.map((item, qIdx) => (
                    <motion.button
                      key={qIdx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: catIdx * 0.1 + qIdx * 0.06 }}
                      whileHover={{
                        x: 6,
                        backgroundColor: `${category.color}10`,
                        borderColor: `${category.color}40`,
                      }}
                      whileTap={{ scale: 0.99 }}
                      onMouseEnter={() => setHoveredQ(item.q)}
                      onMouseLeave={() => setHoveredQ(null)}
                      onClick={() => onSelectQuestion?.(item.q)}
                      className="text-left px-4 py-3.5 rounded-xl flex items-center gap-3 group transition-all"
                      style={{
                        background: 'rgba(0,0,0,0.15)',
                        border: `1px solid ${category.color}18`,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {/* Neon dot */}
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: category.color,
                          boxShadow: `0 0 8px ${category.color}`,
                          transition: 'box-shadow 0.3s ease',
                        }}
                      />

                      <span className="flex-1 text-sm" style={{ color: '#E8F4F8', opacity: 0.85 }}>
                        {item.q}
                      </span>

                      {/* Tag */}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: `${tagColors[item.tag] ?? category.color}15`,
                          border: `1px solid ${tagColors[item.tag] ?? category.color}30`,
                          color: tagColors[item.tag] ?? category.color,
                          fontSize: '9px',
                        }}
                      >
                        {item.tag}
                      </span>

                      {/* Arrow */}
                      <motion.div
                        animate={{ x: hoveredQ === item.q ? 2 : 0, opacity: hoveredQ === item.q ? 1 : 0.3 }}
                        className="flex-shrink-0"
                        style={{ color: category.color }}
                      >
                        {hasDocuments
                          ? <ArrowUpRight size={14} />
                          : <ChevronRight size={14} />}
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Search size={36} className="mx-auto mb-4" style={{ color: '#00F3FF', opacity: 0.3 }} />
              <p className="text-sm" style={{ color: '#E8F4F8', opacity: 0.5 }}>No questions match "{searchQuery}"</p>
            </motion.div>
          )}

          {/* Footer CTA */}
          {!searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center p-6 rounded-2xl"
              style={{
                background: 'rgba(0,243,255,0.04)',
                border: '1px solid rgba(0,243,255,0.15)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-sm mb-3" style={{ color: '#E8F4F8', opacity: 0.65 }}>
                Can't find what you're looking for?
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0,243,255,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, #0d7377, #00F3FF)',
                  color: '#0A0F1E',
                  boxShadow: '0 0 18px rgba(0,243,255,0.3)',
                }}
              >
                Contact Support
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
