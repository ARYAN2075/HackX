import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-8"
          style={{ background: '#05080f' }}
        >
          {/* Glow background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(239,68,68,0.06), transparent 70%)',
            }}
          />

          <div className="relative z-10 text-center max-w-lg">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: '0 0 30px rgba(239,68,68,0.15)',
              }}
            >
              <AlertTriangle size={36} style={{ color: '#ef4444' }} />
            </div>

            <h1
              className="mb-2"
              style={{ color: '#E8F4F8', fontSize: '1.5rem' }}
            >
              Something Went Wrong
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: '#E8F4F8', opacity: 0.5 }}
            >
              {this.props.fallbackMessage ||
                'An unexpected error occurred. This is usually caused by a temporary issue.'}
            </p>

            {/* Error details (collapsed) */}
            {this.state.error && (
              <div
                className="rounded-xl p-4 mb-6 text-left"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: '#ef4444', opacity: 0.8 }}
                >
                  Error Details:
                </p>
                <p
                  className="text-xs font-mono"
                  style={{ color: '#E8F4F8', opacity: 0.6, wordBreak: 'break-all' }}
                >
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(0,243,255,0.08)',
                  border: '1px solid rgba(0,243,255,0.3)',
                  color: '#00F3FF',
                }}
              >
                <Home size={16} />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm"
                style={{
                  background: 'linear-gradient(135deg, #0d7377, #00F3FF)',
                  color: '#0A0F1E',
                  boxShadow: '0 0 20px rgba(0,243,255,0.3)',
                }}
              >
                <RefreshCw size={16} />
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
