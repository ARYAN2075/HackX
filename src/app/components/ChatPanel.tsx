import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Mic,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Star,
  Download,
  Sparkles,
  User,
  Bot,
  Upload,
  FileText,
  Lightbulb,
  Flag,
  CheckCheck,
  AlignLeft,
  Hash,
  BookOpen,
  Layers,
  ShieldCheck,
  Paperclip,
  ImageIcon,
  Table2,
  X,
} from 'lucide-react';
import { AppDocument, ChatHistoryItem } from '../App';
import { ExportModal } from './ExportModal';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'table';
  url?: string;
  tableData?: string[][];
  file: File;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  saved?: boolean;
  userQuestion?: string;
  reaction?: 'up' | 'down' | null;
  emoji?: string | null;
  sources?: { page: number; section: string; snippet: string }[];
  attachments?: Attachment[];
}

interface ChatPanelProps {
  onMessageSent?: () => void;
  activeDocument: AppDocument | null;
  onSaveQuery?: (queryText: string, answer: string, documentName: string) => void;
  onAddHistory?: (item: Omit<ChatHistoryItem, 'id'>) => void;
  pendingQuestion?: string;
  onClearPendingQuestion?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const suggestedQuestions = [
  'What is the main topic of this document?',
  'Summarize the key findings',
  'What are the conclusions?',
  'List the main recommendations',
];

const EMOJI_OPTIONS = ['\u{1F44D}', '\u{1F389}', '\u{1F4A1}', '\u{1F525}', '\u{2753}'];

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];
const TABLE_EXTS = ['.csv', '.tsv'];

/* ═══════════════════════════════════════════════════════════════════════════
   ATTACHMENT HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function isImageFile(name: string): boolean {
  return IMAGE_EXTS.some((ext) => name.toLowerCase().endsWith(ext));
}

function isTableFile(name: string): boolean {
  return TABLE_EXTS.some((ext) => name.toLowerCase().endsWith(ext));
}

async function parseCSV(file: File): Promise<string[][]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  return lines.map((line) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if ((ch === ',' || ch === '\t') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  });
}

async function processAttachmentFile(file: File): Promise<Attachment | null> {
  const name = file.name;
  if (isImageFile(name)) {
    return {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      type: 'image',
      url: URL.createObjectURL(file),
      file,
    };
  }
  if (isTableFile(name)) {
    const tableData = await parseCSV(file);
    return {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      type: 'table',
      tableData,
      file,
    };
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE RENDERER
   ═══════════════════════════════════════════════════════════════════════════ */

function renderMessageContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Bullet point
    if (/^\s*[-\u2022*]\s/.test(line)) {
      return (
        <div key={i} className="flex items-start gap-2 mb-1">
          <span style={{ color: '#00F3FF', marginTop: '0.15em' }}>{'\u2022'}</span>
          <span>{renderInline(line.replace(/^\s*[-\u2022*]\s/, ''))}</span>
        </div>
      );
    }
    // Numbered list
    if (/^\s*\d+\.\s/.test(line)) {
      const numMatch = line.match(/^(\s*\d+\.)\s/);
      return (
        <div key={i} className="flex items-start gap-2 mb-1">
          <span style={{ color: '#00F3FF', flexShrink: 0, minWidth: '1.4rem' }}>{numMatch?.[1]}</span>
          <span>{renderInline(line.replace(/^\s*\d+\.\s/, ''))}</span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="mb-2" />;
    return (
      <p key={i} className="mb-1">
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text: string) {
  // Handle **bold**, then "quoted text"
  const parts = text.split(/(\*\*[^*]+\*\*|"[^"]*")/g);
  return parts.map((part, i) => {
    if (/^\*\*/.test(part)) {
      return (
        <strong key={i} style={{ color: '#38EFF0' }}>
          {part.replace(/\*\*/g, '')}
        </strong>
      );
    }
    if (/^".*"$/.test(part)) {
      return (
        <span key={i} style={{ color: '#a8edea', fontStyle: 'italic' }}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ATTACHMENT RENDERERS (inside message bubbles)
   ═══════════════════════════════════════════════════════════════════════════ */

function AttachmentImagePreview({ att }: { att: Attachment }) {
  return (
    <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,243,255,0.2)' }}>
      <img src={att.url} alt={att.name} className="max-w-full max-h-64 object-contain rounded-xl" />
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.25)' }}>
        <ImageIcon size={11} style={{ color: '#00F3FF' }} />
        <span className="text-xs truncate" style={{ color: '#E8F4F8', opacity: 0.6 }}>
          {att.name}
        </span>
      </div>
    </div>
  );
}

function AttachmentTablePreview({ att }: { att: Attachment }) {
  const data = att.tableData;
  if (!data || data.length === 0) return null;
  const headers = data[0];
  const rows = data.slice(1, 21); // max 20 rows preview
  return (
    <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,243,255,0.2)' }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(0,243,255,0.06)', borderBottom: '1px solid rgba(0,243,255,0.12)' }}>
        <Table2 size={12} style={{ color: '#00F3FF' }} />
        <span className="text-xs" style={{ color: '#00F3FF' }}>{att.name}</span>
        <span className="text-xs ml-auto" style={{ color: '#E8F4F8', opacity: 0.4 }}>
          {data.length - 1} rows \u00D7 {headers.length} cols
        </span>
      </div>
      <div className="overflow-x-auto cyber-scrollbar" style={{ maxHeight: 260 }}>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left whitespace-nowrap" style={{ color: '#38EFF0', background: 'rgba(0,243,255,0.05)', borderBottom: '1px solid rgba(0,243,255,0.15)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 whitespace-nowrap" style={{ color: '#E8F4F8', opacity: 0.8, borderBottom: '1px solid rgba(0,243,255,0.06)' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 21 && (
          <div className="text-xs text-center py-2" style={{ color: '#00F3FF', opacity: 0.5 }}>
            ... and {data.length - 21} more rows
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SMART DOCUMENT Q&A ENGINE (Improved)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Sliding-window chunking with overlap for better retrieval granularity */
function chunkText(text: string): { text: string; index: number; startChar: number }[] {
  const CHUNK_SIZE = 600;
  const OVERLAP = 150;
  const chunks: { text: string; index: number; startChar: number }[] = [];

  // Safety: bail out on empty/tiny input
  if (!text || text.trim().length < 15) {
    return [{ text: text?.trim() || '', index: 0, startChar: 0 }];
  }

  // First try paragraph-based splitting
  const paragraphs = text.split(/\n{2,}|\r\n{2,}/);
  let charOffset = 0;

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi].trim();
    if (para.length < 15) {
      charOffset += para.length + 2;
      continue;
    }

    if (para.length <= CHUNK_SIZE) {
      chunks.push({ text: para, index: chunks.length, startChar: charOffset });
    } else {
      // Slide through long paragraphs
      let pos = 0;
      let safetyCounter = 0;
      const MAX_ITERATIONS = 10000; // prevent infinite loops
      while (pos < para.length && safetyCounter < MAX_ITERATIONS) {
        safetyCounter++;
        const end = Math.min(pos + CHUNK_SIZE, para.length);
        let slice = para.slice(pos, end);
        // Try to end at a sentence boundary
        if (end < para.length) {
          const lastPeriod = slice.lastIndexOf('. ');
          const lastNewline = slice.lastIndexOf('\n');
          const boundary = Math.max(lastPeriod, lastNewline);
          if (boundary > CHUNK_SIZE * 0.4) {
            slice = slice.slice(0, boundary + 1);
          }
        }
        chunks.push({ text: slice.trim(), index: chunks.length, startChar: charOffset + pos });
        // Guarantee minimum forward progress to prevent infinite loop
        // (previously: pos += slice.length - OVERLAP could be 0 when slice.length === OVERLAP)
        const advance = Math.max(slice.length - OVERLAP, 1);
        pos += advance;
      }
    }
    charOffset += para.length + 2;
  }

  // Fallback if too few chunks
  if (chunks.length < 3) {
    const lines = text.split(/\n/).filter((l) => l.trim().length > 15);
    if (lines.length === 0) return [{ text: text.trim().slice(0, CHUNK_SIZE), index: 0, startChar: 0 }];
    return lines.map((l, i) => ({ text: l.trim(), index: i, startChar: 0 }));
  }
  return chunks;
}

/** Extract meaningful keywords from a question, including bigrams */
function extractKeywords(question: string): { singles: string[]; phrases: string[] } {
  const stopwords = new Set([
    'what', 'is', 'the', 'a', 'an', 'of', 'in', 'to', 'and', 'or', 'for',
    'this', 'that', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'shall', 'can', 'about', 'from', 'with', 'at', 'by', 'on', 'it',
    'its', 'how', 'why', 'when', 'where', 'which', 'who', 'whom', 'there',
    'their', 'they', 'them', 'my', 'your', 'our', 'me', 'us', 'i', 'you',
    'he', 'she', 'we', 'all', 'any', 'some', 'no', 'not', 'only', 'very',
    'just', 'also', 'please', 'tell', 'give', 'list', 'show', 'find',
    'document', 'file', 'mentioned', 'describe', 'explain', 'much', 'many',
    'more', 'most', 'other', 'into', 'than', 'then', 'each', 'every',
    'both', 'few', 'after', 'before', 'between', 'through', 'during',
    'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under',
    'again', 'further', 'once', 'here', 'there', 'these', 'those',
  ]);

  const clean = question.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter((w) => w.length > 1);
  const singles = words.filter((w) => w.length > 2 && !stopwords.has(w));

  // Extract bigrams (consecutive word pairs that aren't all stopwords)
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!stopwords.has(words[i]) || !stopwords.has(words[i + 1])) {
      if (words[i].length > 2 && words[i + 1].length > 2) {
        phrases.push(`${words[i]} ${words[i + 1]}`);
      }
    }
  }

  return { singles, phrases };
}

/** Multi-signal relevance scoring */
function scoreChunk(chunk: string, keywords: { singles: string[]; phrases: string[] }): number {
  const lower = chunk.toLowerCase();
  let score = 0;

  // 1. Exact phrase matches (highest weight)
  for (const phrase of keywords.phrases) {
    if (lower.includes(phrase)) {
      score += 8;
    }
  }

  // 2. Individual keyword matches with position weighting
  for (const kw of keywords.singles) {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lower.match(regex);
    if (matches) {
      const freq = matches.length;
      const wordWeight = kw.length > 6 ? 3 : kw.length > 4 ? 2 : 1;
      score += freq * wordWeight;
    }
  }

  // 3. Keyword density bonus (more keywords found = more relevant)
  const uniqueFound = keywords.singles.filter((kw) => lower.includes(kw)).length;
  const coverage = keywords.singles.length > 0 ? uniqueFound / keywords.singles.length : 0;
  score += coverage * 5;

  // 4. Proximity bonus: if multiple keywords appear close together
  if (uniqueFound >= 2) {
    const positions: number[] = [];
    for (const kw of keywords.singles) {
      const idx = lower.indexOf(kw);
      if (idx >= 0) positions.push(idx);
    }
    positions.sort((a, b) => a - b);
    let proximityBonus = 0;
    for (let i = 1; i < positions.length; i++) {
      const gap = positions[i] - positions[i - 1];
      if (gap < 100) proximityBonus += 3;
      else if (gap < 200) proximityBonus += 1;
    }
    score += proximityBonus;
  }

  return score;
}

/** Truncate text preserving word boundaries */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut) + '...';
}

/** Estimate page from chunk position */
function estimatePage(chunkIndex: number, totalChunks: number, totalPages: number): number {
  if (totalChunks <= 0 || totalPages <= 0) return 1;
  return Math.min(totalPages, Math.max(1, Math.ceil(((chunkIndex + 1) / totalChunks) * totalPages)));
}

/** Estimate section label from document position */
function estimateSection(chunkIndex: number, totalChunks: number): string {
  const position = totalChunks > 0 ? chunkIndex / totalChunks : 0;
  if (position < 0.08) return 'Introduction';
  if (position < 0.2) return 'Background';
  if (position < 0.4) return 'Main Content';
  if (position < 0.6) return 'Core Analysis';
  if (position < 0.75) return 'Discussion';
  if (position < 0.88) return 'Results';
  return 'Conclusion';
}

/** Extract the most relevant sentence from a chunk for a given set of keywords */
function extractBestSentence(chunk: string, keywords: { singles: string[] }): string {
  try {
    if (!chunk || chunk.length === 0) return '';
    const sentences = chunk.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
    if (sentences.length === 0) return chunk.slice(0, 400);

    let best = sentences[0];
    let bestScore = 0;
    for (const sent of sentences) {
      const lower = sent.toLowerCase();
      let sc = 0;
      for (const kw of keywords.singles) {
        if (lower.includes(kw)) sc += kw.length;
      }
      if (sc > bestScore) {
        bestScore = sc;
        best = sent;
      }
    }
    return best;
  } catch {
    return chunk?.slice(0, 400) || '';
  }
}

/** Detect question intent */
function detectIntent(q: string): string {
  const lower = q.toLowerCase();
  
  // Check for summary/overview requests (including variations)
  if (
    lower.includes('summarize') || 
    lower.includes('summary') || 
    lower.includes('overview') || 
    lower.includes('brief') ||
    lower.match(/\b(key|main)\s+(points?|insights?|takeaways?|findings?)\b/) ||
    lower.includes('tl;dr') ||
    lower.includes('tldr') ||
    lower.includes('in short') ||
    lower.includes('overall')
  ) return 'summary';
  
  // Check for conclusion requests
  if (
    lower.includes('conclusion') || 
    lower.includes('conclud') ||
    lower.includes('result') || 
    lower.includes('finding') ||
    lower.includes('outcome') ||
    lower.includes('final') ||
    lower.match(/\bwhat.{0,20}(say|suggest|recommend|propose)\b/)
  ) return 'conclusion';
  
  if (lower.includes('main topic') || lower.includes('about') || lower.includes('what is this')) return 'topic';
  if (lower.includes('how') || lower.includes('process') || lower.includes('step') || lower.includes('procedure')) return 'howto';
  if (lower.includes('list') || lower.includes('all') || lower.includes('enumerate') || lower.includes('name')) return 'list';
  if (lower.includes('define') || lower.includes('definition') || lower.includes('meaning') || lower.includes('what does')) return 'definition';
  if (lower.includes('compare') || lower.includes('difference') || lower.includes('versus') || lower.includes('vs')) return 'compare';
  if (lower.includes('why') || lower.includes('reason') || lower.includes('cause')) return 'reason';
  if (lower.includes('when') || lower.includes('date') || lower.includes('timeline') || lower.includes('schedule')) return 'temporal';
  if (lower.includes('who') || lower.includes('author') || lower.includes('responsible') || lower.includes('person')) return 'person';
  if (lower.includes('number') || lower.includes('table') || lower.includes('data') || lower.includes('statistic') || lower.includes('figure') || lower.includes('limit') || lower.includes('rate')) return 'data';
  return 'general';
}

/**
 * Generate a comprehensive summary or conclusion of the entire document.
 * Used when users ask for "summarize", "key insights", "conclusion", etc.
 */
function generateDocumentSummary(
  question: string,
  textContent: string,
  docName: string,
  totalPages: number,
  intent: 'summary' | 'conclusion'
): { text: string; sources: { page: number; section: string; snippet: string }[] } {
  const chunks = chunkText(textContent);
  
  if (!chunks || chunks.length === 0) {
    return generateNoContentResponse(docName);
  }

  // Extract key sections from different parts of the document
  const introduction = chunks.slice(0, Math.min(2, chunks.length));
  const middle = chunks.slice(
    Math.floor(chunks.length * 0.4),
    Math.floor(chunks.length * 0.6)
  );
  const conclusion = chunks.slice(Math.max(0, chunks.length - 2));

  let answerText = '';
  const sources: { page: number; section: string; snippet: string }[] = [];

  if (intent === 'summary') {
    answerText = `# 📄 Summary of "${docName}"\n\n`;
    
    // Introduction section
    if (introduction.length > 0) {
      const introText = introduction.map(c => c.text).join(' ');
      const introPreview = truncate(introText, 300);
      answerText += `## 🔹 Introduction & Background\n\n${introPreview}\n\n`;
      
      // Only add first source from introduction (minimal)
      if (introduction[0]) {
        sources.push({
          page: estimatePage(introduction[0].index, chunks.length, totalPages),
          section: 'Introduction',
          snippet: truncate(introduction[0].text, 150)
        });
      }
    }

    // Key content from middle sections
    if (middle.length > 0) {
      const middleText = middle.map(c => c.text).join(' ');
      const middlePreview = truncate(middleText, 350);
      answerText += `## 🔹 Main Content & Key Points\n\n${middlePreview}\n\n`;
      
      // Only add first source from middle (minimal)
      if (middle[0]) {
        sources.push({
          page: estimatePage(middle[0].index, chunks.length, totalPages),
          section: estimateSection(middle[0].index, chunks.length),
          snippet: truncate(middle[0].text, 150)
        });
      }
    }

    // Conclusion section
    if (conclusion.length > 0) {
      const conclusionText = conclusion.map(c => c.text).join(' ');
      const conclusionPreview = truncate(conclusionText, 250);
      answerText += `## 🔹 Conclusion & Final Points\n\n${conclusionPreview}\n\n`;
      
      // Only add first source from conclusion (minimal)
      if (conclusion[0]) {
        sources.push({
          page: estimatePage(conclusion[0].index, chunks.length, totalPages),
          section: 'Conclusion',
          snippet: truncate(conclusion[0].text, 150)
        });
      }
    }

    // Document statistics
    answerText += `---\n**📊 Document Stats:** ${totalPages} page(s), ${Math.round(textContent.length / 1000)}K characters analyzed\n\n`;
    answerText += `**Summary:** This document has been comprehensively analyzed. The summary above covers the introduction, main content, and conclusions drawn from **"${docName}"**.`;

  } else if (intent === 'conclusion') {
    answerText = `# 🎯 Conclusion & Key Findings from "${docName}"\n\n`;
    
    // Focus on conclusion sections (last 20% of document)
    const conclusionChunks = chunks.slice(Math.max(0, Math.floor(chunks.length * 0.8)));
    
    if (conclusionChunks.length > 0) {
      const conclusionText = conclusionChunks.map(c => c.text).join(' ');
      
      // Extract conclusion sentences
      const sentences = conclusionText
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.length > 30);
      
      const keyFindings = sentences.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n\n');
      
      answerText += `## Key Findings & Results:\n\n${keyFindings}\n\n`;
      
      // Only add first 2 sources from conclusion (minimal)
      conclusionChunks.slice(0, 2).forEach(c => {
        sources.push({
          page: estimatePage(c.index, chunks.length, totalPages),
          section: estimateSection(c.index, chunks.length),
          snippet: truncate(c.text, 150)
        });
      });
    }

    // Also include important points from middle if conclusion is short
    if (conclusionChunks.length < 2 && middle.length > 0) {
      const additionalText = middle.map(c => c.text).join(' ');
      const additionalPreview = truncate(additionalText, 250);
      answerText += `## Additional Important Points:\n\n${additionalPreview}\n\n`;
      
      // Only add first source from middle (minimal)
      if (middle[0]) {
        sources.push({
          page: estimatePage(middle[0].index, chunks.length, totalPages),
          section: estimateSection(middle[0].index, chunks.length),
          snippet: truncate(middle[0].text, 150)
        });
      }
    }

    answerText += `---\n**Summary:** The conclusion and key findings have been extracted from the final sections and important passages of **"${docName}"**. All information is directly sourced from the uploaded document.`;
  }

  return { text: answerText, sources };
}

/**
 * Generate an accurate, document-grounded answer.
 * Retrieves relevant passages, quotes them directly, and appends a summary.
 */
function generateAnswerFromContent(
  question: string,
  textContent: string,
  docName: string,
  totalPages: number
): { text: string; sources: { page: number; section: string; snippet: string }[] } {
  // Safety: validate inputs
  if (!textContent || typeof textContent !== 'string' || textContent.trim().length < 10) {
    return generateNoContentResponse(docName);
  }

  const keywords = extractKeywords(question);
  const chunks = chunkText(textContent);
  const intent = detectIntent(question);

  // Safety: if chunking produced nothing usable, fall back
  if (!chunks || chunks.length === 0) {
    return generateNoContentResponse(docName);
  }

  // Handle summary and conclusion requests with dedicated function
  if (intent === 'summary' || intent === 'conclusion') {
    return generateDocumentSummary(question, textContent, docName, totalPages, intent);
  }

  // Score and rank
  const scored = chunks
    .map((c) => ({ ...c, score: scoreChunk(c.text, keywords) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  // Top relevant chunks (up to 6)
  const topChunks = scored.slice(0, 6);

  // ── No matches ──
  if (topChunks.length === 0) {
    // No relevant content found — be honest, show what the document actually contains
    const preview = chunks.slice(0, 2);  // Minimal sources: reduced from 3 to 2
    const previewText = preview.map((c) => `- ${truncate(c.text, 140)}`).join('\n');
    return {
      text: `I searched through **"${docName}"** but **could not find information related to your question** in the uploaded document.\n\n**Your question may be outside the scope of this document.** I can only answer questions based on the content that was uploaded.\n\n**Here's a preview of what the document actually contains:**\n\n${previewText}\n\n**Tip:** Try rephrasing your question using specific terms or keywords that appear in the document above.\n\n---\n**Summary:** No matching content was found in the uploaded document for your query. Please ask questions related to the document's actual content.`,
      sources: preview.map((c) => ({
        page: estimatePage(c.index, chunks.length, totalPages),
        section: estimateSection(c.index, chunks.length),
        snippet: truncate(c.text, 150),
      })),
    };
  }

  // ── Build answer based on intent ──
  let answerIntro = '';
  switch (intent) {
    case 'summary':
      answerIntro = `Here is a summary based on the content of **"${docName}"**:\n\n`;
      break;
    case 'topic':
      answerIntro = `Based on my analysis of **"${docName}"**, here is what the document is about:\n\n`;
      break;
    case 'conclusion':
      answerIntro = `From the relevant sections of **"${docName}"**, here are the conclusions/findings:\n\n`;
      break;
    case 'howto':
      answerIntro = `According to **"${docName}"**, here is how the process works:\n\n`;
      break;
    case 'list':
      answerIntro = `Here are the relevant items found in **"${docName}"**:\n\n`;
      break;
    case 'definition':
      answerIntro = `Based on **"${docName}"**, here is the relevant definition/explanation:\n\n`;
      break;
    case 'compare':
      answerIntro = `From **"${docName}"**, here is the comparison information:\n\n`;
      break;
    case 'reason':
      answerIntro = `According to **"${docName}"**, the reasons are:\n\n`;
      break;
    case 'temporal':
      answerIntro = `The relevant dates/timeline from **"${docName}"**:\n\n`;
      break;
    case 'person':
      answerIntro = `Based on **"${docName}"**, the relevant people/roles are:\n\n`;
      break;
    case 'data':
      answerIntro = `Here are the relevant data points from **"${docName}"**:\n\n`;
      break;
    default:
      answerIntro = `Based on the content of **"${docName}"**, here is the answer to your question:\n\n`;
  }

  // Compose answer body — directly quote relevant passages
  let answerBody = '';

  if (topChunks.length === 1) {
    // Single strong match — present the passage directly
    const bestSentence = extractBestSentence(topChunks[0].text, keywords);
    answerBody = `**From the document (${estimateSection(topChunks[0].index, chunks.length)}):**\n\n"${truncate(bestSentence, 400)}"\n\n`;
    // Add any remaining context
    if (topChunks[0].text.length > bestSentence.length + 50) {
      const remaining = topChunks[0].text.replace(bestSentence, '').trim();
      if (remaining.length > 30) {
        answerBody += `**Additional context:**\n${truncate(remaining, 300)}\n\n`;
      }
    }
  } else {
    // Multiple matches — structured with direct quotes
    const usedChunks = topChunks.slice(0, 3);  // Minimal sources: reduced from 5 to 3
    answerBody = usedChunks
      .map((c, i) => {
        const section = estimateSection(c.index, chunks.length);
        const bestLine = extractBestSentence(c.text, keywords);
        const page = estimatePage(c.index, chunks.length, totalPages);
        return `${i + 1}. **${section} (Page ${page}):**\n   "${truncate(bestLine, 250)}"`;
      })
      .join('\n\n');
    answerBody += '\n\n';
  }

  // ── Always append a Summary section ──
  const summaryPoints: string[] = [];
  // Extract the single most important sentence from top 3 chunks
  const topSentences = topChunks.slice(0, 3).map((c) => extractBestSentence(c.text, keywords));
  for (const sent of topSentences) {
    const condensed = truncate(sent, 120);
    if (condensed.length > 20) summaryPoints.push(condensed);
  }

  const summaryBlock = `---\n**Summary:** ${
    summaryPoints.length > 0
      ? `The document addresses your question across ${topChunks.length} relevant section(s). Key points: ${summaryPoints.slice(0, 3).map((s) => `"${s}"`).join('; ')}.`
      : `Found ${topChunks.length} relevant passage(s) in the document related to your question.`
  }`;

  // Build sources - minimal set for cleaner display
  const sources = topChunks.slice(0, 3).map((c) => ({  // Reduced from 5 to 3
    page: estimatePage(c.index, chunks.length, totalPages),
    section: estimateSection(c.index, chunks.length),
    snippet: truncate(c.text, 150),
  }));

  return {
    text: answerIntro + answerBody + summaryBlock,
    sources,
  };
}

/**
 * Response when no document text content is available at all.
 * Never fabricates answers — tells the user honestly.
 */
function generateNoContentResponse(
  docName: string
): { text: string; sources: { page: number; section: string; snippet: string }[] } {
  return {
    text: `I'm unable to answer your question because **text extraction was not successful** for **"${docName}"**.\n\nI can only provide answers based on the actual content of your uploaded document. Without extracted text, I cannot search or analyze the document.\n\n**What you can try:**\n- Re-upload the document in a different format (TXT works best, followed by PDF and DOCX)\n- Make sure the file is not corrupted or password-protected\n- For scanned PDFs, try converting them to text-based PDFs first\n\n---\n**Summary:** Text extraction failed for this document. Please re-upload in a supported format (TXT, PDF, or DOCX) so I can analyze its content and answer your questions.`,
    sources: [],
  };
}

/**
 * Fallback — now delegates to generateNoContentResponse.
 * NEVER fabricates generic answers unrelated to the actual document.
 */
function generateSimulatedResponse(
  _question: string,
  docName: string
): { text: string; sources: { page: number; section: string; snippet: string }[] } {
  return generateNoContentResponse(docName);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHAT PANEL COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function ChatPanel({
  onMessageSent,
  activeDocument,
  onSaveQuery,
  onAddHistory,
  pendingQuestion,
  onClearPendingQuestion,
  onShowToast,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [emojiPickerId, setEmojiPickerId] = useState<string | null>(null);
  const [reportedId, setReportedId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const hasDocuments = activeDocument !== null;

  // Initialize welcome message
  useEffect(() => {
    if (activeDocument && messages.length === 0) {
      const hasRealText = !!activeDocument.textContent;
      const textInfo = hasRealText
        ? `I've extracted and indexed the full text content (${Math.round((activeDocument.textContent?.length || 0) / 1000)}K characters). Ask me anything and I'll search the actual document to answer accurately.\n\n**Important:** I only answer questions based on the uploaded document. If your question is not covered in the document, I'll let you know.`
        : `Text extraction is not available for this file format. I won't be able to answer questions until text is extracted. For best results, try re-uploading as a TXT, PDF, or DOCX file.`;

      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: `**${activeDocument.name}** is ready for review!\n\n${textInfo}\n\nYou can also attach **images** and **CSV/TSV tables** to your messages using the paperclip button.\n\nEvery answer includes a **Summary** section at the end for quick reference.`,
          timestamp: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocument]);

  // Auto-send pending question
  useEffect(() => {
    if (pendingQuestion && pendingQuestion.trim() && hasDocuments) {
      const timer = setTimeout(() => {
        handleSend(pendingQuestion);
        onClearPendingQuestion?.();
      }, 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion, hasDocuments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Attachment handling ──
  const handleAttachmentInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const att = await processAttachmentFile(file);
      if (att) {
        setPendingAttachments((prev) => [...prev, att]);
      } else {
        onShowToast?.(`Unsupported file type: ${file.name}. Use images (PNG, JPG, GIF, WEBP) or tables (CSV, TSV).`, 'error');
      }
    }
    e.target.value = '';
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ── Core send function ──
  const handleSend = async (text?: string) => {
    const message = (text ?? inputValue ?? '').trim();
    if ((!message && pendingAttachments.length === 0) || !activeDocument || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message || (pendingAttachments.length > 0 ? `[Attached ${pendingAttachments.length} file(s)]` : ''),
      timestamp: new Date(),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    const currentAttachments = [...pendingAttachments];
    setPendingAttachments([]);
    setIsTyping(true);
    onMessageSent?.();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    let response: { text: string; sources: { page: number; section: string; snippet: string }[] };

    // If user attached a table, acknowledge it
    const tableAttachments = currentAttachments.filter((a) => a.type === 'table');
    const imageAttachments = currentAttachments.filter((a) => a.type === 'image');
    let attachmentAcknowledgment = '';

    if (imageAttachments.length > 0) {
      attachmentAcknowledgment += `\n\n**Attached Image(s):** ${imageAttachments.map((a) => `"${a.name}"`).join(', ')} received. `;
      attachmentAcknowledgment += `Note: Image analysis is performed by the backend AI pipeline. In the current client-side mode, I'll focus on your text question against the document.\n`;
    }

    if (tableAttachments.length > 0) {
      const tableInfo = tableAttachments.map((a) => {
        const rows = a.tableData ? a.tableData.length - 1 : 0;
        const cols = a.tableData && a.tableData[0] ? a.tableData[0].length : 0;
        return `"${a.name}" (${rows} rows \u00D7 ${cols} columns)`;
      }).join(', ');
      attachmentAcknowledgment += `\n\n**Attached Table(s):** ${tableInfo} received and displayed in the chat.\n`;
    }

    if (message) {
      try {
        if (activeDocument.textContent) {
          response = generateAnswerFromContent(message, activeDocument.textContent, activeDocument.name, activeDocument.pages);
        } else {
          response = generateSimulatedResponse(message, activeDocument.name);
        }
      } catch (err) {
        console.error('[ChatPanel] Error generating answer:', err);
        response = generateSimulatedResponse(message, activeDocument.name);
      }
    } else {
      // Only attachments, no question
      response = {
        text: `I've received your attachment(s). Feel free to ask a question about the document, and I'll analyze it alongside your uploaded files.`,
        sources: [],
      };
    }

    // Append attachment acknowledgment
    if (attachmentAcknowledgment) {
      response.text = response.text + attachmentAcknowledgment;
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: response.text,
      timestamp: new Date(),
      saved: false,
      userQuestion: message,
      reaction: null,
      emoji: null,
      sources: response.sources,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);

    const userCount = messages.filter((m) => m.type === 'user').length + 1;
    onAddHistory?.({
      chatTitle: message.length > 55 ? message.slice(0, 55) + '...' : (message || 'File attachment'),
      documentName: activeDocument.name,
      timestamp: new Date(),
      lastMessagePreview: response.text.slice(0, 120) + '...',
      messageCount: userCount,
    });
  };

  const handleSaveQuery = (msg: Message) => {
    if (!msg.userQuestion || !activeDocument || msg.saved) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, saved: true } : m))
    );
    setTimeout(() => {
      onSaveQuery?.(msg.userQuestion!, msg.content, activeDocument.name);
    }, 400);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReaction = (id: string, reaction: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m
      )
    );
  };

  const handleReport = (id: string) => {
    setReportedId(id);
    onShowToast?.('Response reported \u2014 thank you for the feedback.', 'info');
    setTimeout(() => setReportedId(null), 3000);
  };

  // ── No document state ──
  if (!hasDocuments) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8" style={{ background: 'var(--cyber-navy-dark)' }}>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(13,115,119,0.3), rgba(0,243,255,0.1))',
            border: '2px solid rgba(0,243,255,0.25)',
            boxShadow: '0 0 40px rgba(0,243,255,0.15)',
          }}
        >
          <Upload size={40} style={{ color: '#00F3FF', opacity: 0.7 }} />
        </motion.div>
        <h2 className="mb-2" style={{ color: '#E8F4F8' }}>No Document Loaded</h2>
        <p className="text-sm text-center max-w-sm" style={{ color: '#E8F4F8', opacity: 0.5 }}>
          Upload a PDF, DOCX, or TXT file first to start chatting with document intelligence.
        </p>
      </div>
    );
  }

  // ── Active chat ──
  return (
    <div
      className="flex flex-col h-full relative"
      onClick={() => setEmojiPickerId(null)}
      style={{ background: 'var(--cyber-navy-dark)' }}
    >
      {/* Neural dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,243,255,0.05) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(13,115,119,0.1), transparent 70%)',
        }}
      />

      {/* Header */}
      <div
        className="px-6 py-4 border-b flex-shrink-0 relative z-10"
        style={{
          background: 'rgba(10,15,30,0.85)',
          borderColor: 'rgba(0,243,255,0.18)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ color: '#38EFF0' }}>Chat & Q&A</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.6 }}>
                  Document loaded
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Paperclip size={10} style={{ color: '#00F3FF', opacity: 0.5 }} />
                <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.45 }}>
                  Images & Tables supported
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs"
              style={{
                background: 'rgba(0,243,255,0.06)',
                border: '1px solid rgba(0,243,255,0.2)',
                color: '#00F3FF',
                maxWidth: 160,
              }}
            >
              <FileText size={13} />
              <span className="truncate">{activeDocument.name}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,243,255,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); setExportOpen(true); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: 'linear-gradient(135deg, rgba(13,115,119,0.5), rgba(0,243,255,0.18))',
                border: '1px solid rgba(0,243,255,0.42)',
                color: '#00F3FF',
                boxShadow: '0 0 10px rgba(0,243,255,0.15)',
              }}
            >
              <Download size={14} />
              <span>Export</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Suggested questions pill bar */}
      {messages.length <= 1 && (
        <div className="px-6 pt-4 pb-2 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={13} style={{ color: '#00F3FF' }} />
            <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.55 }}>Suggested questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 14px rgba(0,243,255,0.25)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-xl text-xs transition-all"
                style={{
                  background: 'rgba(0,243,255,0.07)',
                  border: '1px solid rgba(0,243,255,0.28)',
                  color: '#00F3FF',
                  boxShadow: '0 0 0px rgba(0,243,255,0)',
                }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 cyber-scrollbar relative z-10">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  background: msg.type === 'user'
                    ? 'linear-gradient(135deg, #0d7377, #00F3FF)'
                    : 'linear-gradient(135deg, rgba(13,115,119,0.5), rgba(0,243,255,0.15))',
                  border: '1px solid rgba(0,243,255,0.35)',
                  boxShadow: '0 0 12px rgba(0,243,255,0.15)',
                }}
              >
                {msg.type === 'user' ? <User size={15} style={{ color: '#0A0F1E' }} /> : <Bot size={15} style={{ color: '#00F3FF' }} />}
              </div>

              <div className={`flex-1 max-w-[85%] ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                {/* Bubble */}
                <div
                  className="relative rounded-2xl px-4 py-3 group"
                  style={{
                    background: msg.type === 'user'
                      ? 'linear-gradient(135deg, rgba(13,115,119,0.5), rgba(0,243,255,0.18))'
                      : 'rgba(13,115,119,0.07)',
                    border: msg.type === 'user'
                      ? '1px solid rgba(0,243,255,0.4)'
                      : '1px solid rgba(0,243,255,0.15)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: msg.type === 'user'
                      ? '0 4px 20px rgba(0,243,255,0.15)'
                      : '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Emoji reaction badge */}
                  {msg.emoji && (
                    <div
                      className="absolute -top-2 -right-2 text-sm px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,243,255,0.2)' }}
                    >
                      {msg.emoji}
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-sm leading-relaxed" style={{ color: '#E8F4F8' }}>
                    {msg.type === 'ai'
                      ? renderMessageContent(msg.content)
                      : <p>{msg.content}</p>}
                  </div>

                  {/* Render attachments inside the bubble */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-2 mt-1">
                      {msg.attachments.map((att) => (
                        att.type === 'image'
                          ? <AttachmentImagePreview key={att.id} att={att} />
                          : <AttachmentTablePreview key={att.id} att={att} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sources section below AI responses */}
                {msg.type === 'ai' && msg.id !== 'welcome' && msg.sources && msg.sources.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(0,243,255,0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(0,243,255,0.1)' }}>
                      <BookOpen size={12} style={{ color: '#00F3FF' }} />
                      <span className="text-xs tracking-wider uppercase" style={{ color: '#00F3FF', opacity: 0.8 }}>
                        Referenced Sources ({msg.sources.length})
                      </span>
                      <Layers size={11} className="ml-auto" style={{ color: '#00F3FF', opacity: 0.4 }} />
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      {msg.sources.map((src, si) => (
                        <div
                          key={si}
                          className="flex items-start gap-2 p-2 rounded-lg"
                          style={{ background: 'rgba(0,243,255,0.03)', border: '1px solid rgba(0,243,255,0.08)' }}
                        >
                          <div
                            className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs"
                            style={{ background: 'rgba(0,243,255,0.12)', color: '#00F3FF', border: '1px solid rgba(0,243,255,0.25)' }}
                          >
                            P.{src.page}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs" style={{ color: '#38EFF0' }}>{src.section}</span>
                            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#E8F4F8', opacity: 0.45, fontStyle: 'italic' }}>
                              "{src.snippet}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* AI action row */}
                {msg.type === 'ai' && msg.id !== 'welcome' && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Reactions */}
                    {[
                      { type: 'up' as const, icon: ThumbsUp },
                      { type: 'down' as const, icon: ThumbsDown },
                    ].map(({ type, icon: Icon }) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReaction(msg.id, type)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{
                          background: msg.reaction === type ? 'rgba(0,243,255,0.15)' : 'transparent',
                          color: msg.reaction === type ? '#00F3FF' : '#E8F4F8',
                          opacity: msg.reaction === type ? 1 : 0.45,
                          border: msg.reaction === type ? '1px solid rgba(0,243,255,0.3)' : '1px solid transparent',
                        }}
                      >
                        <Icon size={13} />
                      </motion.button>
                    ))}

                    {/* Copy */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: copiedId === msg.id ? '#10b981' : '#E8F4F8', opacity: copiedId === msg.id ? 1 : 0.45 }}
                      title="Copy"
                    >
                      {copiedId === msg.id ? <CheckCheck size={13} /> : <Copy size={13} />}
                    </motion.button>

                    {/* Save */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSaveQuery(msg)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{
                        color: msg.saved ? '#fbbf24' : '#E8F4F8',
                        opacity: msg.saved ? 1 : 0.45,
                        background: msg.saved ? 'rgba(251,191,36,0.1)' : 'transparent',
                      }}
                      title="Save query"
                    >
                      <Star size={13} fill={msg.saved ? '#fbbf24' : 'none'} />
                    </motion.button>

                    {/* Emoji picker */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEmojiPickerId(emojiPickerId === msg.id ? null : msg.id);
                        }}
                        className="p-1.5 rounded-lg text-xs"
                        style={{ color: '#E8F4F8', opacity: 0.45 }}
                        title="React"
                      >
                        <Sparkles size={13} />
                      </motion.button>
                      <AnimatePresence>
                        {emojiPickerId === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 4 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-full left-0 mb-2 flex gap-1 px-2 py-1.5 rounded-xl z-20"
                            style={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(0,243,255,0.3)', backdropFilter: 'blur(16px)' }}
                          >
                            {EMOJI_OPTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setMessages((prev) =>
                                    prev.map((m) => m.id === msg.id ? { ...m, emoji: m.emoji === emoji ? null : emoji } : m)
                                  );
                                  setEmojiPickerId(null);
                                }}
                                className="text-base hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Report */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReport(msg.id)}
                      className="p-1.5 rounded-lg"
                      style={{
                        color: reportedId === msg.id ? '#f87171' : '#E8F4F8',
                        opacity: reportedId === msg.id ? 1 : 0.3,
                      }}
                      title="Report"
                    >
                      <Flag size={13} />
                    </motion.button>

                    <span className="text-xs ml-1" style={{ color: '#E8F4F8', opacity: 0.25 }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-end"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(13,115,119,0.5), rgba(0,243,255,0.15))',
                border: '1px solid rgba(0,243,255,0.35)',
              }}
            >
              <Bot size={15} style={{ color: '#00F3FF' }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(13,115,119,0.07)', border: '1px solid rgba(0,243,255,0.15)' }}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs mr-2" style={{ color: '#00F3FF', opacity: 0.7 }}>
                  Analyzing document...
                </span>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#00F3FF' }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div
        className="p-4 border-t flex-shrink-0 relative z-10"
        style={{
          background: 'rgba(10,15,30,0.9)',
          borderColor: 'rgba(0,243,255,0.18)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Quick action buttons */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(0,243,255,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !isTyping && handleSend('Please summarize the key sections of this document in bullet points')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: 'rgba(0,243,255,0.07)',
              border: '1px solid rgba(0,243,255,0.28)',
              color: '#00F3FF',
              opacity: isTyping ? 0.5 : 1,
              cursor: isTyping ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 0px rgba(0,243,255,0)',
            }}
          >
            <AlignLeft size={13} />
            <span>Summarize</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !isTyping && handleSend('What are the key conclusions and action items from this document?')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: 'rgba(56,239,240,0.06)',
              border: '1px solid rgba(56,239,240,0.22)',
              color: '#38EFF0',
              opacity: isTyping ? 0.5 : 1,
              cursor: isTyping ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 0px rgba(56,239,240,0)',
            }}
          >
            <Sparkles size={13} />
            <span>Key Insights</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !isTyping && handleSend('List all important limits, rates, or numerical values mentioned in the document')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: 'rgba(20,161,168,0.07)',
              border: '1px solid rgba(20,161,168,0.22)',
              color: '#14a1a8',
              opacity: isTyping ? 0.5 : 1,
              cursor: isTyping ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 0px rgba(20,161,168,0)',
            }}
          >
            <Hash size={13} />
            <span>Tables & Data</span>
          </motion.button>
        </div>

        {/* Pending attachments preview strip */}
        <AnimatePresence>
          {pendingAttachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex gap-2 flex-wrap"
            >
              {pendingAttachments.map((att) => (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative rounded-xl overflow-hidden flex items-center gap-2 px-3 py-2"
                  style={{
                    background: att.type === 'image' ? 'rgba(139,92,246,0.1)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${att.type === 'image' ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  }}
                >
                  {att.type === 'image' && att.url && (
                    <img src={att.url} alt={att.name} className="w-8 h-8 rounded-lg object-cover" />
                  )}
                  {att.type === 'table' && (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(16,185,129,0.15)' }}
                    >
                      <Table2 size={14} style={{ color: '#10b981' }} />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs truncate max-w-[120px]" style={{ color: '#E8F4F8' }}>
                      {att.name}
                    </span>
                    <span className="text-xs" style={{ color: '#E8F4F8', opacity: 0.4 }}>
                      {att.type === 'image' ? 'Image' : `${att.tableData ? att.tableData.length - 1 : 0} rows`}
                    </span>
                  </div>
                  <button
                    onClick={() => removePendingAttachment(att.id)}
                    className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
                  >
                    <X size={12} style={{ color: '#f87171' }} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text input row */}
        <div className="flex gap-3">
          {/* Attachment button */}
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 0 16px rgba(0,243,255,0.35)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => attachInputRef.current?.click()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: pendingAttachments.length > 0
                ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(0,243,255,0.15))'
                : 'rgba(0,243,255,0.08)',
              border: pendingAttachments.length > 0
                ? '1px solid rgba(139,92,246,0.4)'
                : '1px solid rgba(0,243,255,0.2)',
              boxShadow: '0 0 0px rgba(0,243,255,0)',
            }}
            title="Attach image or table (CSV)"
          >
            <Paperclip size={17} style={{ color: pendingAttachments.length > 0 ? '#a78bfa' : '#00F3FF' }} />
            {pendingAttachments.length > 0 && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                style={{ background: '#8b5cf6', color: '#fff' }}
              >
                {pendingAttachments.length}
              </div>
            )}
          </motion.button>
          <input
            ref={attachInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.csv,.tsv"
            multiple
            onChange={handleAttachmentInput}
            className="hidden"
          />

          <div
            className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5 relative"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(0,243,255,0.28)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask anything about your document..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: '#E8F4F8' }}
              disabled={isTyping}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg"
              style={{ color: '#E8F4F8', opacity: 0.4 }}
              title="Voice input (coming soon)"
            >
              <Mic size={16} />
            </motion.button>
          </div>

          <motion.button
            whileHover={!isTyping ? { scale: 1.06, boxShadow: '0 0 25px rgba(0,243,255,0.6)' } : {}}
            whileTap={!isTyping ? { scale: 0.95 } : {}}
            onClick={() => handleSend()}
            disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isTyping}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: (inputValue.trim() || pendingAttachments.length > 0) && !isTyping
                ? 'linear-gradient(135deg, #0d7377, #00F3FF)'
                : 'rgba(0,243,255,0.1)',
              boxShadow: (inputValue.trim() || pendingAttachments.length > 0) && !isTyping ? '0 0 16px rgba(0,243,255,0.4)' : 'none',
              cursor: (inputValue.trim() || pendingAttachments.length > 0) && !isTyping ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={18} style={{ color: (inputValue.trim() || pendingAttachments.length > 0) && !isTyping ? '#0A0F1E' : '#00F3FF' }} />
          </motion.button>
        </div>

        {/* Bottom hint */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <ShieldCheck size={11} style={{ color: '#10b981', opacity: 0.6 }} />
          <p className="text-xs" style={{ color: '#10b981', opacity: 0.5 }}>
            Answers are strictly grounded in uploaded document content \u2022 Every response includes a summary
          </p>
        </div>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        messages={messages.map((m) => ({ type: m.type, content: m.content, timestamp: m.timestamp }))}
        documentName={activeDocument?.name ?? 'document'}
      />
    </div>
  );
}
