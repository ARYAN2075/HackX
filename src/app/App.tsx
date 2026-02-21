import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { Dashboard } from './components/Dashboard';
import { ChatPanel } from './components/ChatPanel';
import { DocumentPreview } from './components/DocumentPreview';
import { FAQSuggestions } from './components/FAQSuggestions';
import { SavedQueries } from './components/SavedQueries';
import { HistoryPage } from './components/HistoryPage';
import { SettingsModal } from './components/SettingsModal';
import { UploadPage } from './components/UploadPage';
import { ToastContainer, ToastProps } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getSession, clearSession } from './utils/authService';
import '../styles/cyber-theme.css';

type Page =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'upload'
  | 'chat'
  | 'faq'
  | 'saved'
  | 'history'
  | 'settings';

/** The single active document. Only one document is active at a time. */
export interface AppDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  pages: number;
  /** Blob URL created from the real File — used to render the actual document in the preview panel. */
  objectUrl?: string;
  /** Extracted text content from the uploaded document (available for TXT files, simulated for others). */
  textContent?: string;
}

export interface ChatHistoryItem {
  id: string;
  chatTitle: string;
  documentName: string;
  timestamp: Date;
  lastMessagePreview: string;
  messageCount: number;
}

export interface SavedQueryItem {
  id: string;
  queryText: string;
  answer: string;
  documentName: string;
  savedAt: Date;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Check for existing session on mount ─────────────────────────────────
  useEffect(() => {
    const session = getSession();
    if (session) {
      setIsAuthenticated(true);
      setUserName(session.name);
      setUserEmail(session.email);
      setCurrentPage('dashboard');
    }
  }, []);

  // ── Single active document ─────────────────────────────────────────────────
  const [activeDocument, setActiveDocument] = useState<AppDocument | null>(null);

  const [chatCount, setChatCount] = useState(0);
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQueryItem[]>([]);

  const hasDocument = activeDocument !== null;

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: removeToast }]);
  };
  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Theme toggle ───────────────────────────────────────────────────────────
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      addToast(`${next ? 'Dark' : 'Light'} mode activated`, 'info');
      return next;
    });
  };

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleLogin = (name?: string) => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    if (name) setUserName(name);
    addToast('Welcome back! Successfully logged in.', 'success');
  };

  const handleSignup = (name?: string) => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    if (name) setUserName(name);
    addToast('Account created successfully! Welcome aboard.', 'success');
  };

  const handleLogout = () => {
    clearSession(); // Clear session from localStorage
    setIsAuthenticated(false);
    setCurrentPage('welcome');
    setActiveDocument(null);
    setChatCount(0);
    setChatHistory([]);
    setSavedQueries([]);
    setUserName('');
    setUserEmail('');
    setMobileSidebarOpen(false);
    addToast('Logged out successfully', 'info');
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNavigate = (page: string) => {
    if (page === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setCurrentPage(page as Page);
    }
    // Close mobile sidebar on navigation
    setMobileSidebarOpen(false);
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleUploadSuccess = (doc: AppDocument) => {
    const isReplacing = activeDocument !== null;
    // Revoke previous blob URL to free memory
    if (activeDocument?.objectUrl) {
      URL.revokeObjectURL(activeDocument.objectUrl);
    }
    setActiveDocument(doc);
    if (isReplacing) {
      addToast(`New document loaded: "${doc.name}" is now active.`, 'success');
    } else {
      addToast(`"${doc.name}" processed successfully!`, 'success');
    }
    setTimeout(() => setCurrentPage('chat'), 1500);
  };

  // ── Chat / history / queries ───────────────────────────────────────────────
  const handleMessageSent = () => setChatCount((c) => c + 1);

  const handleSaveQuery = (queryText: string, answer: string, documentName: string) => {
    const item: SavedQueryItem = {
      id: Date.now().toString(),
      queryText,
      answer,
      documentName,
      savedAt: new Date(),
    };
    setSavedQueries((prev) => [item, ...prev]);
    addToast('Query saved to your collection!', 'success');
  };

  const handleAddChatHistory = (item: Omit<ChatHistoryItem, 'id'>) => {
    setChatHistory((prev) => [{ ...item, id: Date.now().toString() }, ...prev]);
  };

  const handleDeleteHistory = (id: string) => {
    setChatHistory((prev) => prev.filter((h) => h.id !== id));
    addToast('History entry removed', 'info');
  };

  const handleDeleteSavedQuery = (id: string) => {
    setSavedQueries((prev) => prev.filter((q) => q.id !== id));
    addToast('Saved query deleted', 'info');
  };

  const handleRerunQuery = (queryText: string) => {
    setPendingQuestion(queryText);
    setCurrentPage('chat');
    addToast('Query loaded — sending to chat...', 'info');
  };

  const handleSelectQuestion = (question: string) => {
    if (question.trim()) {
      setPendingQuestion(question);
      addToast('Question added to chat', 'info');
    }
    setCurrentPage('chat');
  };

  const isChatPage = currentPage === 'chat';

  // ── Protected route enforcement ────────────────────────────────────────────
  // If user is NOT authenticated, force them to welcome/login/signup only.
  // This catches edge cases like manually setting page state to 'upload', etc.
  const effectivePage: Page = !isAuthenticated
    ? (['welcome', 'login', 'signup'].includes(currentPage)
        ? currentPage
        : 'login')
    : currentPage;

  // ── Unauthenticated pages ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? '' : 'light-mode'}>
        <AnimatePresence mode="wait">
          {effectivePage === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WelcomeScreen onNavigate={handleNavigate} />
            </motion.div>
          )}
          {effectivePage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
            </motion.div>
          )}
          {effectivePage === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SignupPage onNavigate={handleNavigate} onSignup={handleSignup} />
            </motion.div>
          )}
        </AnimatePresence>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // ── Authenticated layout ───────────────────────────────────────────────────
  return (
    <div
      className={`h-screen flex ${isDarkMode ? '' : 'light-mode'}`}
      style={{ background: 'var(--cyber-navy-dark)' }}
    >
      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (desktop: static, mobile: slide-over) ── */}
      <div
        className={`
          fixed lg:relative z-50 h-screen
          transform transition-transform duration-300 ease-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar
          activePage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userName={userName}
          hasDocuments={hasDocument}
          activeDocumentName={activeDocument?.name}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Top Header Bar ── */}
        <TopHeader
          userName={userName}
          userEmail={userEmail}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* ── Page Content ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center panel */}
          <div
            className="flex-1 overflow-hidden"
            style={{
              borderRight: isChatPage ? '1px solid rgba(0,217,255,0.2)' : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {currentPage === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <Dashboard
                    onNavigate={handleNavigate}
                    activeDocument={activeDocument}
                    chatCount={chatCount}
                  />
                </motion.div>
              )}
              {currentPage === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <ErrorBoundary fallbackMessage="Upload page encountered an error. Try reloading.">
                    <UploadPage
                      onUploadSuccess={handleUploadSuccess}
                      activeDocument={activeDocument}
                    />
                  </ErrorBoundary>
                </motion.div>
              )}
              {currentPage === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ErrorBoundary fallbackMessage="Chat panel encountered an error. Try reloading.">
                    <ChatPanel
                      key={activeDocument?.id ?? 'no-doc'}
                      onMessageSent={handleMessageSent}
                      activeDocument={activeDocument}
                      onSaveQuery={handleSaveQuery}
                      onAddHistory={handleAddChatHistory}
                      pendingQuestion={pendingQuestion}
                      onClearPendingQuestion={() => setPendingQuestion('')}
                      onShowToast={addToast}
                    />
                  </ErrorBoundary>
                </motion.div>
              )}
              {currentPage === 'faq' && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <FAQSuggestions
                    onSelectQuestion={handleSelectQuestion}
                    hasDocuments={hasDocument}
                  />
                </motion.div>
              )}
              {currentPage === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <SavedQueries
                    queries={savedQueries}
                    onDeleteQuery={handleDeleteSavedQuery}
                    onRerunQuery={handleRerunQuery}
                  />
                </motion.div>
              )}
              {currentPage === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <HistoryPage
                    history={chatHistory}
                    onDeleteHistory={handleDeleteHistory}
                    onNavigateToChat={handleSelectQuestion}
                    hasDocuments={hasDocument}
                    onNavigateToUpload={() => handleNavigate('upload')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel — Document Preview (chat page only, hidden on mobile) */}
          {isChatPage && (
            <div
              className="overflow-hidden flex-shrink-0 hidden xl:block"
              style={{ width: 380, background: 'var(--cyber-navy)' }}
            >
              <ErrorBoundary fallbackMessage="Document preview encountered an error.">
                <DocumentPreview
                  key={activeDocument?.id ?? 'empty'}
                  activeDocument={activeDocument}
                />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleTheme}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}