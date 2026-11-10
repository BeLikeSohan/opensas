import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { cancelHold, confirmHold } from '../api';
import Alert from '../components/Alert';
import ApplicationClassCard from '../components/ApplicationClassCard';
import ApplicationDetails from '../components/ApplicationDetails';
import ApplicationStatusPanel, { type HoldAction } from '../components/ApplicationStatusPanel';
import StatusBadge from '../components/StatusBadge';
import StudentIdInput from '../components/StudentIdInput';
import Toast from '../components/Toast';
import { useClass } from '../hooks/useClass';
import { useHold } from '../hooks/useHold';
import { useNow } from '../hooks/useNow';
import { useStudentId } from '../hooks/useStudentId';
import { useToast } from '../hooks/useToast';
import { HoldStatus } from '../types';
import { effectiveStatus, holdErrorMessage } from '../utils/holdStatus';
import { studentIdError } from '../utils/studentId';

/** "আবেদন" page: one application with its class, countdown and pay/cancel actions. */
function ApplicationPage() {
  const { holdId } = useParams<{ holdId: string }>();
  const { studentId, setStudentId } = useStudentId();
  const { hold, error, notFound, isLoading, refresh: refreshHold } = useHold(holdId);
  const { schoolClass, refresh: refreshClass } = useClass(hold?.classId);
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const [pending, setPending] = useState<HoldAction | null>(null);
  const [studentIdRequired, setStudentIdRequired] = useState(false);
  const now = useNow();

  const status = hold ? effectiveStatus(hold, now) : null;
  const className = schoolClass?.name ?? 'এই';

  // The deadline just passed on the clock: fetch the real status and seat counts.
  const expiredLocally = hold?.status === HoldStatus.HELD && status === HoldStatus.EXPIRED;
  useEffect(() => {
    if (!expiredLocally) return;
    refreshHold();
    refreshClass();
  }, [expiredLocally, refreshHold, refreshClass]);

  const runAction = async (action: HoldAction) => {
    if (!hold) return;

    const idError = studentIdError(studentId);
    if (idError) {
      setStudentIdRequired(true);
      showToast({ variant: 'err', title: 'জন্ম নিবন্ধন নম্বর প্রয়োজন', message: idError });
      return;
    }

    if (
      action === 'cancel' &&
      !window.confirm(`"${className}" শ্রেণির আবেদনটি বাতিল করতে চান? আসনটি অন্যদের জন্য ছেড়ে দেওয়া হবে।`)
    ) {
      return;
    }

    setPending(action);
    try {
      if (action === 'confirm') {
        await confirmHold(hold.holdId, studentId);
        showToast({
          variant: 'ok',
          title: 'ভর্তি নিশ্চিত হয়েছে',
          message: `"${className}" শ্রেণিতে আপনার ভর্তি ফি পরিশোধ সম্পন্ন হয়েছে।`,
        });
      } else {
        await cancelHold(hold.holdId, studentId);
        showToast({
          variant: 'ok',
          title: 'আবেদন বাতিল হয়েছে',
          message: `"${className}" শ্রেণির সংরক্ষিত আসনটি ছেড়ে দেওয়া হয়েছে।`,
        });
      }
    } catch (err) {
      showToast({
        variant: 'err',
        title: action === 'confirm' ? 'ভর্তি ফি পরিশোধ করা যায়নি' : 'আবেদন বাতিল করা যায়নি',
        message: holdErrorMessage(err),
      });
    } finally {
      setPending(null);
      refreshHold();
      refreshClass();
    }
  };

  return (
    <main className="page page--narrow">
      <Link className="back-link" to="/my-applications">
        ← আমার আবেদন
      </Link>

      <div className="page-head page-head--split">
        <div>
          <h1>আবেদন</h1>
          {schoolClass && <p className="lead">{schoolClass.name}</p>}
        </div>
        {status && <StatusBadge status={status} />}
      </div>

      {isLoading && <p className="empty">লোড হচ্ছে...</p>}

      {notFound ? (
        <Alert variant="error" message="আবেদনটি খুঁজে পাওয়া যায়নি। লিংকটি সঠিক কিনা দেখুন।" />
      ) : (
        error && <Alert variant="error" message={`আবেদনের তথ্য লোড করা যায়নি: ${error}`} />
      )}

      {hold && status && (
        <>
          {status === HoldStatus.HELD && studentIdRequired && (
            <StudentIdInput value={studentId} onChange={setStudentId} forceError />
          )}

          <ApplicationStatusPanel
            status={status}
            expiresAt={hold.expiresAt}
            now={now}
            pending={pending}
            onConfirm={() => void runAction('confirm')}
            onCancel={() => void runAction('cancel')}
          />

          <div className="detail-grid">
            <ApplicationClassCard schoolClass={schoolClass} />
            <ApplicationDetails hold={hold} status={status} />
          </div>
        </>
      )}

      {toast && <Toast toast={toast} onClose={dismissToast} />}
    </main>
  );
}

export default ApplicationPage;
