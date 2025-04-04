import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo
    });
    
    // Here you could send to a monitoring service or analytics
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: send error to a service
        // reportError({ error, errorInfo });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="min-h-screen bg-red-50 p-8 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Oops! A apărut o eroare
            </h1>
            <p className="text-gray-700 mb-4">
              Ne pare rău, a apărut o problemă neașteptată. Am înregistrat această eroare și o vom remedia în curând.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6">
                <details className="bg-gray-100 p-4 rounded-lg">
                  <summary className="font-semibold cursor-pointer">
                    Detalii eroare (doar în modul dezvoltare)
                  </summary>
                  <div className="mt-3">
                    <p className="text-red-600 font-mono text-sm mb-2">
                      {this.state.error?.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition mr-4"
              >
                Înapoi la pagina principală
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition"
              >
                Reîncarcă pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
