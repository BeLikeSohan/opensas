import { useEffect } from 'react';
import { Link } from 'react-router';
import { useNow } from '../hooks/useNow';
import { formatCountdown } from '../utils/format';

interface HoldCountdownProps {
  holdId: string;
  expiresAt: string;
  onExpire: () => void;
}

/** Link to a held application with a live countdown; calls `onExpire` once time runs out. */
function HoldCountdown({ holdId, expiresAt, onExpire }: HoldCountdownProps) {
  const now = useNow();
  const remaining = new Date(expiresAt).getTime() - now;
  const expired = remaining <= 0;

  useEffect(() => {
    if (expired) onExpire();
  }, [expired, onExpire]);

  if (expired) {
    return (
      <div className="held-link" role="status">
        <span>আপনার সংরক্ষণের মেয়াদ শেষ হয়েছে</span>
      </div>
    );
  }

  return (
    <Link className="held-link" to={`/applications/${holdId}`}>
      <span>
        আপনার আসন সংরক্ষিত · ফি পরিশোধের বাকি সময়{' '}
        <span className="mono">{formatCountdown(remaining)}</span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

export default HoldCountdown;
