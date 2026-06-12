import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Oops! Terjadi Kesalahan
            </h1>
            <p className="text-slate-600 mb-6">
              Aplikasi mengalami error yang tidak terduga. Silakan muat ulang halaman.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-slate-100 rounded-lg p-4 mb-6 overflow-auto max-h-40 text-rose-600">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
