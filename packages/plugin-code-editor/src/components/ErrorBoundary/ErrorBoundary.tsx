import React, { Component, ErrorInfo, Suspense } from 'react';
import { Loading, Message, Button } from '@alifd/next';

import './ErrorBoundary.less';
import { intl } from '../../locale';

interface ErrorBoundaryProps {
  onCatch?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  info: null | ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  state = {
    hasError: false,
    info: null,
  };

  componentDidCatch(error: Error, info: ErrorInfo) {
    const { onCatch } = this.props;
    if (onCatch) {
      onCatch(error, info);
      this.setState({ info });
    }
  }

  render() {
    const { children } = this.props;
    const { hasError, info } = this.state;
    // const error = new Error('component render error');
    const errorInfo = { stack: info?.componentStack || '' };
    if (!hasError) {
      return <Suspense fallback={<Loading visible />}>{children}</Suspense>;
    }
    return (
      <Message title={intl('ErrorBoundaryTitle')} type="error">
        <p>{intl('ErrorBoundaryDetail')}: {errorInfo || intl('UnknownReason')}</p>
        <div className="plugin-code-editor-errorBoundary-actions">
          <Button onClick={this._handleReset} size="small">
            {intl('Retry')}
          </Button>
        </div>
      </Message>
    );
  }

  private _handleReset = () => {
    this.setState({ hasError: false });
  };
}
