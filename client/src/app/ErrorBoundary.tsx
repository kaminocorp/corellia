import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onError?: (error: Error) => void;
  label?: string;
  /** The boundary recovers when this value changes identity (the spec, for generated UI). */
  resetKey?: unknown;
};
type State = { error: Error | null };

/**
 * Keeps a render failure in the generated UI from taking the whole screen
 * (and the 3D agent) down. Resets when `resetKey` changes (the parent's
 * `children` prop is a new element on every render, so it is no signal).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error);
    console.error("render failure", error, info.componentStack);
  }

  componentDidUpdate(prev: Props): void {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="m-4 border border-destructive/60 bg-card/80 p-3 font-mono text-xs text-destructive" role="alert">
          {this.props.label ?? "render failure"}: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
