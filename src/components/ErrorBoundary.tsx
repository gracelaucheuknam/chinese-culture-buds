import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || '未知錯誤' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reload = () => {
    window.location.hash = '#start';
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="screen"
        role="alert"
        style={{ background: 'linear-gradient(160deg, #fff6e8, #ffe0b2)' }}
      >
        <h1>哎呀，出咗少少問題</h1>
        <p>唔使驚，撳下面可以重新開始。進度通常仍然保存在本機。</p>
        <p style={{ fontSize: 14, opacity: 0.7 }}>{this.state.message}</p>
        <button type="button" className="nav-chip" onClick={this.reload}>
          重新開始
        </button>
      </div>
    );
  }
}
