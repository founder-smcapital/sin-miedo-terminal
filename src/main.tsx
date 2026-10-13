import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught terminal runtime error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#070C14',
            color: '#EDE9DE',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'monospace'
          }}
        >
          <div
            style={{
              maxWidth: '640px',
              width: '100%',
              backgroundColor: '#0F1622',
              border: '1px solid rgba(176, 141, 87, 0.4)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ color: '#B08D57', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.05em' }}>
              SIN MIEDO CAPITAL // TERMINAL RUNTIME DIAGNOSTIC
            </div>
            <div style={{ color: '#EF4444', fontSize: '12px', marginBottom: '16px', wordBreak: 'break-word', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {this.state.error?.message || "An unexpected error occurred during terminal render."}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#B08D57',
                  color: '#070C14',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Reset Session & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
