import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const logger = console;

class DebugErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error details
    logger.debug(`🔴 Error in ${this.props.componentName || "component"}`);
    logger.error("Error details:", error);
    logger.error("Component stack:", errorInfo.componentStack);
    logger.debug("End of error log");
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">
            A apărut o eroare în {this.props.componentName || "acest component"}
          </h3>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-2">
              <p className="text-sm text-red-600">{this.state.error.message}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;
