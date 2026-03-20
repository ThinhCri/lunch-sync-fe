import { Suspense } from 'react';
import { Spin } from 'antd';

export function AsyncBoundary({ children, fallback }) {
  return (
    <Suspense fallback={fallback || (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 48 }}>
        <Spin size="large" />
      </div>
    )}>
      {children}
    </Suspense>
  );
}
