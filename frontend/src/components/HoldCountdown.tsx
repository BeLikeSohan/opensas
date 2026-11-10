import { useEffect } from 'react';
import { useNow } from '../hooks/useNow';
import { formatCountdown } from '../utils/format';

interface HoldCountdownProps {
  expiresAt: string;
  onExpire: () => void;
}

/** Banner for a held seat with a live countdown; calls `onExpire` once time runs out. */
function HoldCountdown({ expiresAt, onExpire }: HoldCountdownProps) {
  const now = useNow();
  const remaining = new Date(expiresAt).getTime() - now;
  const expired = remaining <= 0;

  useEffect(() => {
    if (expired) onExpire();
  }, [expired, onExpire]);

  return (
    <div className="held-link" role="status">
      {expired ? (
        <span>আপনার সংরক্ষণের মেয়াদ শেষ হয়েছে</span>
      ) : (
        <span>
          আপনার আসন সংরক্ষিত · ফি পরিশোধের বাকি সময়{' '}
          <span className="mono">{formatCountdown(remaining)}</span>
        </span>
      )}
    </div>
  );
}

export default HoldCountdown;
