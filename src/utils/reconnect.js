// Re-sync polling khi tab quay lại foreground
// Gọi callback khi visibilitychange → visible

export function onVisibilityChange(callback) {
  const handler = () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}

// Polling với exponential backoff khi lỗi
export function createPoller(fn, { interval = 3000, maxRetries = 3 } = {}) {
  let timer = null;
  let retries = 0;

  const poll = async () => {
    try {
      await fn();
      retries = 0;
    } catch (err) {
      retries++;
      if (retries >= maxRetries) {
      return;
      }
    }
    timer = setTimeout(poll, interval);
  };

  return {
    start: () => { if (!timer) poll(); },
    stop: () => { clearTimeout(timer); timer = null; },
  };
}
