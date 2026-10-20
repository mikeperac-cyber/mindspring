import { useAppStore } from '../app/store';

export function StorageNotice() {
  const { notice, dismissNotice } = useAppStore();
  if (!notice) return null;

  return (
    <div className="storage-notice" role="status">
      <span>{notice}</span>
      <button type="button" aria-label="Dismiss notice" onClick={dismissNotice}>×</button>
    </div>
  );
}
