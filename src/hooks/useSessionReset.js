import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/store/toastStore';

const clearSessionStorage = () => {
  localStorage.removeItem('lunchsync-session');
  localStorage.removeItem('lunchsync-session-store');
};

/** Status values that allow a non-host (participant) to exit the session. */
const ALLOWED_EXIT_NON_HOST = new Set(['results', 'picking', 'done']);

/**
 * Navigates to the page corresponding to the given session status.
 * Used when a session is still active and we need to redirect back
 * instead of allowing the user to exit.
 */
export function redirectToPageByStatus(status, pin, navigate) {
  switch (status) {
    case 'waiting':
      navigate(`/lobby/${pin}`);
      break;
    case 'voting':
    case 'voting-wait':
      navigate(`/vote/${pin}`);
      break;
    case 'results':
      navigate(`/results/${pin}`);
      break;
    case 'boom':
      navigate(`/boom/${pin}`);
      break;
    case 'picking':
    case 'done':
      navigate(`/done/${pin}`);
      break;
    default:
      navigate(`/lobby/${pin}`);
  }
}

/** Clears session storage and resets the store state. */
export function clearSession() {
  clearSessionStorage();
  useSessionStore.getState().reset();
}

/**
 * Core logic: checks session status and decides whether to exit or redirect back.
 *
 * NON-HOST (participant):
 *   - Status is results / picking / done  → exit, full reload to '/'
 *   - Any other status                     → redirect back to current page
 *
 * HOST:
 *   - Status === 'done'                    → exit, full reload to '/create'
 *   - Any other status                     → redirect back to current page
 *
 * If no active session (no pin/sessionId), navigates to '/' without resetting.
 *
 * @param {object} options
 * @param {function} options.navigate  - React Router navigate function
 * @param {function} [options.onError] - Called when network request fails
 */
export async function handleSessionExit({ navigate, onError }) {
  const { pin, sessionId, isHost } = useSessionStore.getState();

  if (!pin || !sessionId) {
    navigate('/');
    return;
  }

  let status;
  try {
    const res = await api.sessions.getStatus(pin, sessionId);
    status = res.data?.status;
  } catch {
    onError?.();
    return;
  }

  // Non-host: can only exit on results / picking / done
  if (!isHost && ALLOWED_EXIT_NON_HOST.has(status)) {
    clearSession();
    window.location.href = '/';
    return;
  }

  // Host: can only exit when done
  if (isHost && status === 'done') {
    clearSession();
    window.location.href = '/create';
    return;
  }

  // Any other status → redirect back to the page matching the current status
  redirectToPageByStatus(status, pin, navigate);
}

/**
 * Standalone version (no React hooks dependency).
 * Reads state directly from stores. Always uses window.location for navigation.
 */
export async function handleSessionExitStandalone() {
  const { pin, sessionId, isHost } = useSessionStore.getState();

  if (!pin || !sessionId) {
    window.location.href = '/';
    return;
  }

  let status;
  try {
    const res = await api.sessions.getStatus(pin, sessionId);
    status = res.data?.status;
  } catch {
    return;
  }

  if (!isHost && ALLOWED_EXIT_NON_HOST.has(status)) {
    clearSession();
    window.location.href = '/';
    return;
  }

  if (isHost && status === 'done') {
    clearSession();
    window.location.href = '/create';
    return;
  }
}

/**
 * Handles session-end when the status is already known (cancelled/expired/completed).
 * This is used by pages that already received the status from an API response.
 *
 * NON-HOST (participant):
 *   - Status is results / picking / done  → exit, full reload to '/'
 *   - Any other status                   → redirect back to page matching the status
 *
 * HOST:
 *   - Status === 'done'                  → exit, full reload to '/create'
 *   - Any other status                   → redirect back to page matching the status
 */
export function handleSessionEndByStatus(status, pin, navigate) {
  const { isHost } = useSessionStore.getState();

  if (!isHost && ALLOWED_EXIT_NON_HOST.has(status)) {
    clearSession();
    window.location.href = '/';
    return;
  }

  if (isHost && status === 'done') {
    clearSession();
    window.location.href = '/create';
    return;
  }

  redirectToPageByStatus(status, pin, navigate);
}

/**
 * Hook version of handleSessionExit.
 * Use this in components that need a loading state or toast feedback.
 */
export function useSessionExit() {
  const navigate = useNavigate();
  const { show } = useToastStore();

  return useCallback(async () => {
    await handleSessionExit({
      navigate,
      onError: () => {
        show('Không thể rời phiên. Vui lòng thử lại.', 'error');
      },
    });
  }, [navigate, show]);
}
