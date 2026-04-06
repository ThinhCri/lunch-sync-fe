import { Component } from 'react';
import { Button, Result } from 'antd';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle="Vui lòng tải lại trang để tiếp tục."
          extra={<Button type="primary" onClick={() => window.location.reload()}>Tải lại</Button>}
        />
      );
    }
    return this.props.children;
  }
}
