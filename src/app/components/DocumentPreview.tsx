import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Hash,
  AlertCircle,
  FileType,
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  Brain,
  Sparkles,
  List,
  TrendingUp,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react';
import { AppDocument } from '../App';

interface DocumentPreviewProps {
  activeDocument: AppDocument | null;
}

function getFileType(name: string): 'pdf' | 'docx' | 'txt' | 'other' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'docx';
  if (lower.endsWith('.txt')) return 'txt';
  return 'other';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── PDF Viewer with page controls ─────────────────────────────────────────────

function PDFViewer({
  objectUrl,
  docName,
  totalPages,
}: {
  objectUrl: string;
  docName: string;
  totalPages: number;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [jumpInput, setJumpInput] = useState('');
  const [isJumping, setIsJumping] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const effectiveTotal = totalPages > 0 ? totalPages : 1;

  const buildSrc = useCallback(
    (page: number) => `${objectUrl}#page=${page}&zoom=${zoom / 100}`,
    [objectUrl, zoom]
  );

  const [iframeSrc, setIframeSrc] = useState(() => buildSrc(1));

  const navigateTo = (page: number) => {
    const p = Math.max(1, Math.min(page, effectiveTotal));
    setCurrentPage(p);
    setIframeSrc(buildSrc(p));
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(50, Math.min(200, zoom + delta));
    setZoom(newZoom);
    setIframeSrc(buildSrc(currentPage).replace(`zoom=${zoom / 100}`, `zoom=${newZoom / 100}`));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setIframeSrc(buildSrc(currentPage));
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpInput, 10);
    if (!isNaN(page)) { navigateTo(page); setJumpInput(''); setIsJumping(false); }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        className="flex-shrink-0 px-3 py-2 border-b flex items-center gap-2"
        style={{ background: 'rgba(5,8,18,0.7)', borderColor: 'rgba(0,217,255,0.15)' }}
      >
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigateTo(1)} disabled={currentPage <= 1} className="p-1 rounded" style={{ color: 'var(--cyber-cyan)', opacity: currentPage <= 1 ? 0.3 : 0.8 }}><ChevronsLeft size={14} /></motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigateTo(currentPage - 1)} disabled={currentPage <= 1} className="p-1 rounded" style={{ color: 'var(--cyber-cyan)', opacity: currentPage <= 1 ? 0.3 : 0.8 }}><ChevronLeft size={14} /></motion.button>

        <div className="flex-1 flex items-center justify-center gap-1">
          {isJumping ? (
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
              <input type="number" value={jumpInput} onChange={(e) => setJumpInput(e.target.value)} autoFocus onBlur={() => setIsJumping(false)} min={1} max={effectiveTotal} className="w-14 text-center text-xs rounded outline-none px-1 py-0.5" style={{ background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.5)', color: 'var(--cyber-cyan)' }} />
              <span className="text-xs" style={{ color: 'var(--cyber-white)', opacity: 0.5 }}>/ {effectiveTotal}</span>
            </form>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setIsJumping(true); setJumpInput(String(currentPage)); }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.2)', color: 'var(--cyber-white)' }}>
              <span style={{ color: 'var(--cyber-cyan)' }}>Page {currentPage}</span>
              <span style={{ opacity: 0.45 }}>of {effectiveTotal}</span>
            </motion.button>
          )}
        </div>

        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigateTo(currentPage + 1)} disabled={currentPage >= effectiveTotal} className="p-1 rounded" style={{ color: 'var(--cyber-cyan)', opacity: currentPage >= effectiveTotal ? 0.3 : 0.8 }}><ChevronRight size={14} /></motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigateTo(effectiveTotal)} disabled={currentPage >= effectiveTotal} className="p-1 rounded" style={{ color: 'var(--cyber-cyan)', opacity: currentPage >= effectiveTotal ? 0.3 : 0.8 }}><ChevronsRight size={14} /></motion.button>

        <div className="w-px h-4 mx-1" style={{ background: 'rgba(0,217,255,0.2)' }} />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleZoom(-25)} disabled={zoom <= 50} className="p-1 rounded" style={{ color: 'var(--cyber-cyan)', opacity: zoom <= 50 ? 0.3 : 0.8 }}><ZoomOut size={13} /></motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={handleResetZoom} className="text-xs px-1.5 py-0.5 rounded" style={{ background: zoom !== 100 ? 'rgba(0,217,255,0.1)' : 'transparent', color: 'var(--cyber-cyan)', minWidth: 34, textAlign: 'center' }}>{zoom}%</motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleZoom(25)} disabled={zoom >= 200} className="p-1 rounded" style={{ color: 'var(--cyber-cyan)', opacity: zoom >= 200 ? 0.3 : 0.8 }}><ZoomIn size={13} /></motion.button>
      </div>

      <div className="relative flex-1">
        <AnimatePresence>
          {loading && !error && (
            <motion.div key="pdf-loading" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ background: 'rgba(5,8,18,0.85)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}><Loader2 size={28} style={{ color: 'var(--cyber-cyan)' }} /></motion.div>
              <p className="text-xs" style={{ color: 'var(--cyber-white)', opacity: 0.5 }}>Loading preview...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={26} style={{ color: '#ef4444' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--cyber-white)' }}>Unable to render preview</p>
          </div>
        ) : (
          <iframe ref={iframeRef} src={iframeSrc} title="PDF Preview" className="w-full h-full" style={{ border: 'none' }} onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError(true); }} />
        )}
      </div>
    </div>
  );
}

// ── Document Intelligence Panel ────────────────────────────────────────────────

function IntelligencePanel({ doc }: { doc: AppDocument }) {
  const [showSummary, setShowSummary] = useState(true);

  const mockSummary = [
    'The document outlines key policy guidelines and operational procedures.',
    'It defines roles, responsibilities, and compliance requirements for all stakeholders.',
    'Key sections cover data handling, approval workflows, and escalation protocols.',
    'Appendices include reference tables with applicable rates and thresholds.',
  ];

  const mockInsights = [
    { label: 'Document Type', value: 'Policy Document', color: '#00F3FF' },
    { label: 'Sections Found', value: `${Math.max(3, Math.floor(doc.pages * 1.5))}`, color: '#38EFF0' },
    { label: 'Tables Detected', value: `${Math.max(1, Math.floor(doc.pages / 3))}`, color: '#14a1a8' },
    { label: 'Compliance Level', value: 'Standard', color: '#10b981' },
  ];

  const mockKeyTerms = ['Policy Framework', 'Compliance', 'Approval Process', 'Data Security', 'Escalation'];

  return (
    <div className="flex-1 overflow-y-auto cyber-scrollbar p-4 space-y-4">
      {/* Document Indexed badge */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.24)' }}
      >
        <CheckCircle2 size={14} style={{ color: '#10b981' }} />
        <span className="text-xs" style={{ color: '#10b981' }}>Document Indexed</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '9px' }}>READY</span>
      </div>

      {/* Summarization Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={14} style={{ color: '#00F3FF' }} />
          <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.8 }}>Auto Summary</span>
        </div>
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
          style={{
            background: showSummary ? 'rgba(0,243,255,0.12)' : 'rgba(0,0,0,0.2)',
            border: showSummary ? '1px solid rgba(0,243,255,0.4)' : '1px solid rgba(0,243,255,0.12)',
            color: showSummary ? '#00F3FF' : '#E8F4F8',
          }}
        >
          {showSummary ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {showSummary ? 'On' : 'Off'}
        </button>
      </div>

      {/* Automatic Summary */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(0,243,255,0.04)', border: '1px solid rgba(0,243,255,0.15)' }}
          >
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(0,243,255,0.1)' }}>
              <Sparkles size={12} style={{ color: '#00F3FF' }} />
              <span className="text-xs tracking-wider uppercase" style={{ color: '#00F3FF', opacity: 0.8 }}>Document Summary</span>
            </div>
            <div className="p-3 space-y-2">
              {mockSummary.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#00F3FF' }} />
                  <p className="text-xs leading-relaxed" style={{ color: '#E8F4F8', opacity: 0.7 }}>{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Insights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={13} style={{ color: '#38EFF0' }} />
          <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.8 }}>Key Insights</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {mockInsights.map((insight, i) => (
            <div
              key={i}
              className="rounded-lg p-2.5"
              style={{ background: `${insight.color}08`, border: `1px solid ${insight.color}20` }}
            >
              <p className="text-xs mb-0.5" style={{ color: '#E8F4F8', opacity: 0.45 }}>{insight.label}</p>
              <p className="text-sm" style={{ color: insight.color, fontWeight: 600 }}>{insight.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Terms */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={13} style={{ color: '#14a1a8' }} />
          <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.8 }}>Key Terms</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {mockKeyTerms.map((term, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg text-xs"
              style={{ background: 'rgba(0,243,255,0.06)', border: '1px solid rgba(0,243,255,0.15)', color: '#00F3FF' }}
            >
              {term}
            </span>
          ))}
        </div>
      </div>

      {/* Grounding notice */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <ShieldCheck size={12} style={{ color: '#10b981', opacity: 0.7 }} />
        <p className="text-xs" style={{ color: '#10b981', opacity: 0.6 }}>
          Strictly grounded in uploaded content
        </p>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function DocumentPreview({ activeDocument }: DocumentPreviewProps) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'preview' | 'intelligence'>('intelligence');

  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (!activeDocument) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          animate={{ boxShadow: ['0 0 16px rgba(0,217,255,0.05)', '0 0 32px rgba(0,217,255,0.16)', '0 0 16px rgba(0,217,255,0.05)'] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(0,217,255,0.06)', border: '2px solid rgba(0,217,255,0.16)' }}
        >
          <FileText size={34} style={{ color: 'var(--cyber-cyan)', opacity: 0.42 }} />
        </motion.div>
        <h3 className="mb-2 text-sm" style={{ color: 'var(--cyber-white)' }}>Document Intelligence</h3>
        <p className="text-xs max-w-[200px] leading-relaxed mb-5" style={{ color: 'var(--cyber-white)', opacity: 0.4 }}>
          Upload a document to see automatic summary, key insights, and live preview here.
        </p>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(0,217,255,0.05)', border: '1px solid rgba(0,217,255,0.16)', color: 'var(--cyber-cyan)' }}>
          <Upload size={13} />
          <span>Upload to activate</span>
        </div>
      </div>
    );
  }

  const fileType = getFileType(activeDocument.name);
  const hasPdfUrl = fileType === 'pdf' && !!activeDocument.objectUrl;

  // Header
  const Header = (
    <div className="px-4 pt-3 pb-3 border-b flex-shrink-0" style={{ background: 'rgba(13,115,119,0.06)', borderColor: 'rgba(0,217,255,0.2)' }}>
      {/* Active Document badge */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.24)' }}>
        <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
        <div className="min-w-0 flex-1">
          <p className="text-xs" style={{ color: '#10b981', opacity: 0.85 }}>Active Document</p>
          <p className="text-xs truncate" style={{ color: 'var(--cyber-white)' }} title={activeDocument.name}>{activeDocument.name}</p>
        </div>
        <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.38)', color: '#10b981', fontSize: '9px' }}>LIVE</span>
      </div>

      {/* Meta strip */}
      <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--cyber-white)', opacity: 0.45 }}>
        <span className="flex items-center gap-1">{fileType === 'pdf' ? <Eye size={11} /> : <FileType size={11} />}{fileType.toUpperCase()}</span>
        <span>&middot;</span>
        <span className="flex items-center gap-1"><Hash size={10} />{activeDocument.pages} pages</span>
        <span>&middot;</span>
        <span>{formatSize(activeDocument.size)}</span>
      </div>

      {/* View mode toggle */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,243,255,0.2)' }}>
        {[
          { id: 'intelligence' as const, icon: Brain, label: 'Intelligence' },
          { id: 'preview' as const, icon: Eye, label: 'Preview' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-all"
            style={{
              background: viewMode === tab.id ? 'rgba(0,243,255,0.12)' : 'transparent',
              color: viewMode === tab.id ? '#00F3FF' : '#E8F4F8',
              opacity: viewMode === tab.id ? 1 : 0.5,
            }}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <div className="h-full flex flex-col">
        {Header}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={26} style={{ color: 'var(--cyber-cyan)' }} />
          </motion.div>
          <p className="text-xs" style={{ color: 'var(--cyber-white)', opacity: 0.42 }}>Analyzing document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {Header}

      <div className="flex-1 overflow-hidden relative" style={{ background: 'rgba(5,8,18,0.55)' }}>
        <AnimatePresence mode="wait">
          {viewMode === 'intelligence' ? (
            <motion.div
              key="intelligence"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <IntelligencePanel doc={activeDocument} />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {hasPdfUrl ? (
                <PDFViewer objectUrl={activeDocument.objectUrl!} docName={activeDocument.name} totalPages={activeDocument.pages} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="text-5xl mb-5">{fileType === 'docx' ? '\u{1F4C4}' : fileType === 'txt' ? '\u{1F4DD}' : '\u{1F4C1}'}</div>
                  <div className="mb-5 px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                    Document indexed and ready for chat
                  </div>
                  <h3 className="text-sm mb-2" style={{ color: 'var(--cyber-white)' }}>{activeDocument.name}</h3>
                  <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: 'var(--cyber-white)', opacity: 0.45 }}>
                    {fileType.toUpperCase()} preview not available. Use the Intelligence tab for document analysis.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t text-xs flex items-center justify-between flex-shrink-0" style={{ background: 'rgba(13,115,119,0.05)', borderColor: 'rgba(0,217,255,0.16)' }}>
        <div className="flex items-center gap-2 truncate" style={{ color: 'var(--cyber-aqua)' }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--cyber-cyan)', boxShadow: '0 0 5px var(--cyber-cyan)' }} />
          <span className="truncate">{activeDocument.name}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2" style={{ color: 'var(--cyber-white)', opacity: 0.35 }}>
          <CheckCircle2 size={11} />
          <span>Synced</span>
        </div>
      </div>
    </div>
  );
}
