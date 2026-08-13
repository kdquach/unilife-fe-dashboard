import React from "react";
import { Button, Result } from "antd";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught runtime render error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <Result
            status="500"
            title="Something went wrong"
            subTitle={
              this.state.error?.message ||
              "An unexpected error occurred in the dashboard interface."
            }
            extra={
              <Button type="primary" onClick={this.handleReload}>
                Reload Application
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
