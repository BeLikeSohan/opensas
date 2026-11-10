import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { cancelHold, confirmHold, isApiError } from '../api';
import Alert from '../components/Alert';
import ApplicationTabs from '../components/ApplicationTabs';
import ApplicationsTable, { type ApplicationView, type PendingHoldAction } from '../components/ApplicationsTable';
import HeldBanner from '../components/HeldBanner';
import StudentIdInput from '../components/StudentIdInput';
import Toast from '../components/Toast';
import { useMyHolds } from '../hooks/useMyHolds';
import { useNow } from '../hooks/useNow';
import { useStudentId } from '../hooks/useStudentId';
import { useToast } from '../hooks/useToast';
import { HoldStatus, type StudentHold } from '../types';
import { APPLICATION_TABS, type ApplicationTabKey } from '../utils/applicationTabs';
import { effectiveStatus } from '../utils/holdStatus';

/** Bangla text for the backend's confirm/cancel errors (matched on ProblemDetails title). */
function actionErrorMessage(err: unknown): string {
  if (!isApiError(err)) return 'অজানা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
  switch (err.title) {
    case 'Application expired':
      return 'আবেদনের মেয়াদ শেষ হয়ে গেছে, আসনটি ছেড়ে দেওয়া হয়েছে।';
    case 'Application cannot be confirmed':
      return 'এই আবেদনটি আর নিশ্চিত করা যাবে না।';
    case 'Application cannot be cancelled':
      return 'এই আবেদনটি আর বাতিল করা যাবে না।';
    case 'Application not found':
      return 'আবেদনটি খুঁজে পাওয়া যায়নি।';
    default:
      return err.message;
  }
}

function MyApplicationsPage() {
  const { studentId, setStudentId, isValid } = useStudentId();
  const { holds, error, isLoading, refresh } = useMyHolds(studentId, isValid);
  const [activeTab, setActiveTab] = useState<ApplicationTabKey>('all');
  const [pending, setPending] = useState<PendingHoldAction | null>(null);
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const now = useNow();

  const handleConfirm = async (hold: StudentHold) => {
    setPending({ holdId: hold.holdId, action: 'confirm' });
    try {
      await confirmHold(hold.holdId, studentId);
      showToast({
        variant: 'ok',
        title: 'ভর্তি নিশ্চিত হয়েছে',
        message: `"${hold.className}" শ্রেণিতে আপনার ভর্তি ফি পরিশোধ সম্পন্ন হয়েছে।`,
      });
    } catch (err) {
      showToast({ variant: 'err', title: 'ভর্তি ফি পরিশোধ করা যায়নি', message: actionErrorMessage(err) });
    } finally {
      setPending(null);
      refresh();
    }
  };

  const handleCancel = async (hold: StudentHold) => {
    if (!window.confirm(`"${hold.className}" শ্রেণির আবেদনটি বাতিল করতে চান? আসনটি অন্যদের জন্য ছেড়ে দেওয়া হবে।`)) {
      return;
    }
    setPending({ holdId: hold.holdId, action: 'cancel' });
    try {
      await cancelHold(hold.holdId, studentId);
      showToast({
        variant: 'ok',
        title: 'আবেদন বাতিল হয়েছে',
        message: `"${hold.className}" শ্রেণির সংরক্ষিত আসনটি ছেড়ে দেওয়া হয়েছে।`,
      });
    } catch (err) {
      showToast({ variant: 'err', title: 'আবেদন বাতিল করা যায়নি', message: actionErrorMessage(err) });
    } finally {
      setPending(null);
      refresh();
    }
  };

  // Newest deadline first; status is re-derived every second so expiries show without a reload.
  const applications = useMemo<ApplicationView[]>(
    () =>
      [...(holds ?? [])]
        .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
        .map((hold) => ({ hold, status: effectiveStatus(hold, now) })),
    [holds, now],
  );

  // A hold just ran out on the clock: ask the server for its real status.
  const expiredLocally = applications.some(
    (a) => a.hold.status === HoldStatus.HELD && a.status === HoldStatus.EXPIRED,
  );
  useEffect(() => {
    if (expiredLocally) refresh();
  }, [expiredLocally, refresh]);

  const tab = APPLICATION_TABS.find((t) => t.key === activeTab) ?? APPLICATION_TABS[0];
  const visible = applications.filter((a) => tab.match(a.status));
  const activeHold = applications.find((a) => a.status === HoldStatus.HELD)?.hold;

  return (
    <main className="page">
      <div className="page-head page-head--split">
        <div>
          <h1>আমার আবেদন</h1>
          {isValid ? (
            <p className="lead">
              জন্ম নিবন্ধন নম্বর <span className="mono lead__id">{studentId}</span> এর সব আবেদন — পেজ রিফ্রেশ করলে
              বা অন্য ডিভাইস থেকে খুললেও এখানে থাকবে।{' '}
              <button type="button" className="link-btn" onClick={() => setStudentId('')}>
                নম্বর পরিবর্তন করুন
              </button>
            </p>
          ) : (
            <p className="lead">আপনার আবেদনগুলো দেখতে জন্ম নিবন্ধন নম্বর দিন।</p>
          )}
        </div>
        <Link className="btn-dark" to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          শ্রেণিতে আবেদন করুন
        </Link>
      </div>

      {!isValid && <StudentIdInput value={studentId} onChange={setStudentId} />}

      {isValid && (
        <>
          {error && <Alert variant="error" message={`আবেদনের তালিকা লোড করা যায়নি: ${error}`} />}

          {isLoading && <p className="empty">লোড হচ্ছে...</p>}

          {holds && (
            <>
              {activeHold && <HeldBanner hold={activeHold} now={now} />}

              <ApplicationTabs
                statuses={applications.map((a) => a.status)}
                active={activeTab}
                onChange={setActiveTab}
              />

              <ApplicationsTable
                applications={visible}
                now={now}
                pending={pending}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            </>
          )}
        </>
      )}

      {toast && <Toast toast={toast} onClose={dismissToast} />}
    </main>
  );
}

export default MyApplicationsPage;
