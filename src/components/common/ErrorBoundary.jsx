import { Component } from 'react';
import { RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Silently swallow — UI already renders fallback
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Đã xảy ra lỗi</h2>
          <p className="text-on-surface-variant text-sm text-center mb-8 max-w-xs">
            Vui lòng tải lại trang để tiếp tục.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
