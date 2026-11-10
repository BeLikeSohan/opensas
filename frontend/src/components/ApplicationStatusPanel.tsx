import { Link } from 'react-router';
import { HoldStatus } from '../types';
import { formatCountdown, formatDateTime } from '../utils/format';

export type HoldAction = 'confirm' | 'cancel';

interface ApplicationStatusPanelProps {
  status: HoldStatus;
  expiresAt: string;
  now: number;
  pending: HoldAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** The main panel of the application page: countdown + actions, or the final outcome. */
function ApplicationStatusPanel({ status, expiresAt, now, pending, onConfirm, onCancel }: ApplicationStatusPanelProps) {
  switch (status) {
    case HoldStatus.HELD:
      return (
        <section className="status-panel status-panel--held">
          <div>
            <span className="status-panel__label">ফি পরিশোধের বাকি সময়</span>
            <span className="status-panel__clock mono">{formatCountdown(new Date(expiresAt).getTime() - now)}</span>
            <p className="status-panel__text">
              আপনার জন্য একটি আসন সংরক্ষিত আছে। {formatDateTime(expiresAt)} এর মধ্যে ভর্তি ফি পরিশোধ না করলে আসনটি
              অন্যদের জন্য ছেড়ে দেওয়া হবে।
            </p>
          </div>
          <div className="status-panel__actions">
            <button
              type="button"
              className="btn-green btn-lg"
              disabled={pending !== null}
              aria-busy={pending === 'confirm'}
              onClick={onConfirm}
            >
              {pending === 'confirm' ? 'পরিশোধ হচ্ছে…' : 'ভর্তি ফি পরিশোধ করুন'}
            </button>
            <button
              type="button"
              className="btn-outline btn-lg"
              disabled={pending !== null}
              aria-busy={pending === 'cancel'}
              onClick={onCancel}
            >
              {pending === 'cancel' ? 'বাতিল হচ্ছে…' : 'আবেদন বাতিল করুন'}
            </button>
          </div>
        </section>
      );

    case HoldStatus.CONFIRMED:
      return (
        <section className="status-panel status-panel--confirmed">
          <div>
            <span className="status-panel__title">আপনার ভর্তি নিশ্চিত হয়েছে</span>
            <p className="status-panel__text">ভর্তি ফি পরিশোধ সম্পন্ন হয়েছে। এই শ্রেণিতে আপনার আসন নিশ্চিত।</p>
          </div>
        </section>
      );

    case HoldStatus.EXPIRED:
      return (
        <section className="status-panel status-panel--expired">
          <div>
            <span className="status-panel__title">আবেদনের মেয়াদ শেষ হয়েছে</span>
            <p className="status-panel__text">
              {formatDateTime(expiresAt)} এর মধ্যে ভর্তি ফি পরিশোধ করা হয়নি, তাই আসনটি ছেড়ে দেওয়া হয়েছে।
            </p>
          </div>
          <Link className="btn-dark" to="/">
            আবার আবেদন করুন
          </Link>
        </section>
      );

    case HoldStatus.CANCELLED:
      return (
        <section className="status-panel status-panel--cancelled">
          <div>
            <span className="status-panel__title">আবেদন বাতিল করা হয়েছে</span>
            <p className="status-panel__text">সংরক্ষিত আসনটি অন্যদের জন্য ছেড়ে দেওয়া হয়েছে।</p>
          </div>
          <Link className="btn-dark" to="/">
            অন্য শ্রেণিতে আবেদন করুন
          </Link>
        </section>
      );
  }
}

export default ApplicationStatusPanel;
