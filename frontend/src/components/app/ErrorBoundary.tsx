import React from "react";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err: any) {
    return { hasError: true, message: err?.message ?? "Something went wrong" };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-semibold text-white">UI crashed</div>
          <div className="mt-2 text-sm text-white/70">{this.state.message}</div>
          <button
            className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

