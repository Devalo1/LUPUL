import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Componenta ErrorBoundary pentru gestionarea erorilor în aplicație
 * Prinde erorile JavaScript din componente copil și afișează o interfață de rezervă
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Eroare prinsa de ErrorBoundary:", error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI alternativ implicit pentru afișarea erorilor
      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ceva nu a funcționat corect</h1>
            <p className="text-gray-700 mb-4">
              Aplicația a întâmpinat o eroare. Vă rugăm să reîncărcați pagina sau să încercați din nou mai târziu.
            </p>
            
            <div className="mb-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reîncarcă pagina
              </button>
            </div>
            
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 bg-gray-100 p-4 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Detalii eroare (vizibile doar în mediul de dezvoltare):</h2>
                <p className="text-red-600 mb-2">{this.state.error?.toString()}</p>
                
                <div className="overflow-auto max-h-64 bg-gray-800 text-white p-4 rounded-md text-sm">
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;