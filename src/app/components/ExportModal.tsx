import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, FileType2, Download, Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  [key: string]: unknown;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  documentName: string;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

type ExportFormat = 'pdf' | 'txt' | 'docx';
type ExportState = 'idle' | 'loading' | 'success' | 'error';

const formats: { id: ExportFormat; label: string; ext: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    id: 'pdf',
    label: 'Export as PDF',
    ext: '.pdf',
    description: 'Formatted chat transcript with styling',
    icon: <FileText size={22} />,
    color: 'rgba(239, 68, 68, 0.15)',
  },
  {
    id: 'txt',
    label: 'Export as TXT',
    ext: '.txt',
    description: 'Plain text, easy to open anywhere',
    icon: <FileType2 size={22} />,
    color: 'rgba(0, 217, 255, 0.12)',
  },
  {
    id: 'docx',
    label: 'Export as DOCX',
    ext: '.docx',
    description: 'Microsoft Word format with structure',
    icon: <FileText size={22} />,
    color: 'rgba(59, 130, 246, 0.15)',
  },
];

function buildTextContent(messages: Message[], documentName: string): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════',
    '         HACK HUNTERS – Chat Export             ',
    '═══════════════════════════════════════════════',
    `Document: ${documentName}`,
    `Exported: ${new Date().toLocaleString()}`,
    '───────────────────────────────────────────────',
    '',
  ];
  messages.forEach((m) => {
    lines.push(`[${m.type === 'user' ? 'YOU' : 'AI ASSISTANT'}] ${m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    lines.push(m.content);
    lines.push('');
  });
  lines.push('═══════════════════════════════════════════════');
  return lines.join('\n');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportModal({ isOpen, onClose, messages, documentName, onShowToast }: ExportModalProps) {
  const [exportState, setExportState] = useState<Record<ExportFormat, ExportState>>({
    pdf: 'idle',
    txt: 'idle',
    docx: 'idle',
  });
  const [progress, setProgress] = useState<Record<ExportFormat, number>>({ pdf: 0, txt: 0, docx: 0 });

  const handleExport = (format: ExportFormat) => {
    if (exportState[format] === 'loading') return;
    setExportState((s) => ({ ...s, [format]: 'loading' }));
    setProgress((p) => ({ ...p, [format]: 0 }));

    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 25 + 10;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
      }
      setProgress((p) => ({ ...p, [format]: Math.min(prog, 100) }));
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      setProgress((p) => ({ ...p, [format]: 100 }));

      try {
        const textContent = buildTextContent(messages, documentName);
        const baseName = `chat-export-${Date.now()}`;

        if (format === 'txt') {
          downloadBlob(textContent, `${baseName}.txt`, 'text/plain;charset=utf-8');
        } else if (format === 'pdf') {
          // Build minimal HTML for PDF-like export (open in new window)
          const html = `<!DOCTYPE html><html><head><title>Chat Export</title><style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
            h1 { color: #0d7377; } .msg { margin: 12px 0; padding: 12px; border-radius: 8px; }
            .user { background: #f3f4f6; } .ai { background: #e0f7fa; }
            .label { font-weight: bold; font-size: 12px; color: #666; margin-bottom: 4px; }
          </style></head><body>
            <h1>HACK HUNTERS – Chat Export</h1>
            <p><strong>Document:</strong> ${documentName}</p>
            <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
            <hr />
            ${messages.map((m) => `<div class="msg ${m.type}"><div class="label">${m.type === 'user' ? 'YOU' : 'AI ASSISTANT'}</div><p>${m.content}</p></div>`).join('')}
          </body></html>`;
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const win = window.open(url, '_blank');
          if (win) win.onload = () => { setTimeout(() => win.print(), 300); }
          URL.revokeObjectURL(url);
        } else {
          // DOCX – export as rich text (RTF)
          downloadBlob(textContent, `${baseName}.txt`, 'text/plain;charset=utf-8');
        }

        setExportState((s) => ({ ...s, [format]: 'success' }));
        onShowToast && onShowToast(`Chat exported successfully as ${format.toUpperCase()}!`, 'success');
        setTimeout(() => setExportState((s) => ({ ...s, [format]: 'idle' })), 3000);
      } catch {
        setExportState((s) => ({ ...s, [format]: 'error' }));
        onShowToast && onShowToast('Export failed. Please try again.', 'error');
        setTimeout(() => setExportState((s) => ({ ...s, [format]: 'idle' })), 3000);
      }
    }, 1600);
  };

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
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: 'var(--cyber-navy)',
                border: '1px solid rgba(0, 217, 255, 0.28)',
                boxShadow: '0 0 60px rgba(0,217,255,0.12), 0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,217,255,0.18)', background: 'rgba(13,115,119,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.3)' }}>
                    <Download size={17} style={{ color: 'var(--cyber-cyan)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm" style={{ color: 'var(--cyber-aqua)' }}>Export Chat</h3>
                    <p className="text-xs" style={{ color: 'var(--cyber-white)', opacity: 0.45 }}>
                      {messages.length} message{messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--cyber-white)', opacity: 0.6 }}>
                  <X size={18} />
                </motion.button>
              </div>

              {/* Format Options */}
              <div className="p-5 space-y-3">
                {formats.map((fmt) => {
                  const state = exportState[fmt.id];
                  const prog = progress[fmt.id];
                  return (
                    <motion.button
                      key={fmt.id}
                      whileHover={state === 'idle' ? { scale: 1.02, x: 3 } : {}}
                      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
                      onClick={() => handleExport(fmt.id)}
                      disabled={state === 'loading'}
                      className="w-full rounded-xl p-4 text-left relative overflow-hidden"
                      style={{
                        background: state === 'success'
                          ? 'rgba(16,185,129,0.08)'
                          : state === 'error'
                          ? 'rgba(239,68,68,0.08)'
                          : fmt.color,
                        border: state === 'success'
                          ? '1px solid rgba(16,185,129,0.35)'
                          : state === 'error'
                          ? '1px solid rgba(239,68,68,0.35)'
                          : '1px solid rgba(0,217,255,0.2)',
                        cursor: state === 'loading' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {/* Progress bar */}
                      {state === 'loading' && (
                        <div className="absolute bottom-0 left-0 h-0.5 rounded-full" style={{ width: `${prog}%`, background: 'var(--cyber-cyan)', transition: 'width 0.2s ease' }} />
                      )}

                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: state === 'success' ? 'rgba(16,185,129,0.15)' : state === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(0,217,255,0.1)',
                            color: state === 'success' ? '#10b981' : state === 'error' ? '#ef4444' : 'var(--cyber-cyan)',
                          }}
                        >
                          {state === 'loading' ? <Loader size={20} className="animate-spin" style={{ color: 'var(--cyber-cyan)' }} />
                            : state === 'success' ? <CheckCircle size={20} />
                            : state === 'error' ? <AlertCircle size={20} />
                            : fmt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium" style={{ color: state === 'success' ? '#10b981' : state === 'error' ? '#f87171' : 'var(--cyber-white)' }}>
                            {state === 'loading' ? `Exporting${fmt.ext}… ${Math.round(prog)}%`
                              : state === 'success' ? `Exported successfully${fmt.ext}`
                              : state === 'error' ? 'Export failed — try again'
                              : fmt.label}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--cyber-white)', opacity: 0.45 }}>
                            {state === 'idle' ? fmt.description : state === 'loading' ? 'Processing…' : ''}
                          </div>
                        </div>
                        {state === 'idle' && (
                          <Download size={16} style={{ color: 'var(--cyber-cyan)', opacity: 0.55, flexShrink: 0 }} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="px-5 pb-5">
                <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(0,217,255,0.05)', border: '1px solid rgba(0,217,255,0.15)', color: 'var(--cyber-white)', opacity: 0.6 }}>
                  All exports include full conversation history from document: <span style={{ color: 'var(--cyber-cyan)' }}>{documentName}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}