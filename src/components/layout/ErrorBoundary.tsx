import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h1 className="text-xl font-bold text-red-800 mb-2">A apărut o eroare</h1>
          {process.env.NODE_ENV === 'development' && (
            <div>
              <p className="text-red-600">{this.state.error?.message}</p>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
