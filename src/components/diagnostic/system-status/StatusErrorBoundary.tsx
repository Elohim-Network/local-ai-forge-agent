
import React from "react";

interface StatusErrorBoundaryProps {
  children: React.ReactNode;
}

interface StatusErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class StatusErrorBoundary extends React.Component<
  StatusErrorBoundaryProps,
  StatusErrorBoundaryState
> {
  constructor(props: StatusErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("SystemComponentStatus error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-300 bg-red-50 p-4 rounded-md">
          <h3 className="text-red-700 font-medium">Component Error</h3>
          <p className="text-sm text-red-600">
            {this.state.error?.message || "An unknown error occurred"}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
