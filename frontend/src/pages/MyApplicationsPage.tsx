import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import Alert from '../components/Alert';
import ApplicationTabs from '../components/ApplicationTabs';
import ApplicationsTable, { type ApplicationView } from '../components/ApplicationsTable';
import HeldBanner from '../components/HeldBanner';
import StudentIdInput from '../components/StudentIdInput';
import { useMyHolds } from '../hooks/useMyHolds';
import { useNow } from '../hooks/useNow';
import { useStudentId } from '../hooks/useStudentId';
import { HoldStatus } from '../types';
import { APPLICATION_TABS, type ApplicationTabKey } from '../utils/applicationTabs';
import { effectiveStatus } from '../utils/holdStatus';

function MyApplicationsPage() {
  const { studentId, setStudentId, isValid } = useStudentId();
  const { holds, error, isLoading, refresh } = useMyHolds(studentId, isValid);
  const [activeTab, setActiveTab] = useState<ApplicationTabKey>('all');
  const now = useNow();

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

              <ApplicationsTable applications={visible} now={now} />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default MyApplicationsPage;
