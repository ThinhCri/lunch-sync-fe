import { EmptyState } from '@/components/common/EmptyState';

export default function LobbyPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: 'var(--space-6)' }}>
      <EmptyState
        title="Trang đang được xây dựng"
        description="Phase 3: Lobby sẽ được triển khai tiếp theo."
      />
    </div>
  );
}
