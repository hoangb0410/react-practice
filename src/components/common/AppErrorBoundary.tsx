import { Component, ErrorInfo, ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface IState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): IState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
