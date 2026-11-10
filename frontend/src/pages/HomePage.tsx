import { useCallback, useRef, useState } from 'react';
import { createHold, isApiError } from '../api';
import Alert from '../components/Alert';
import ClassGrid from '../components/ClassGrid';
import StudentIdInput from '../components/StudentIdInput';
import Toast from '../components/Toast';
import TopBar from '../components/TopBar';
import { CLASSES_REFRESH_MS, useClasses } from '../hooks/useClasses';
import { useMyHolds } from '../hooks/useMyHolds';
import { useStudentId } from '../hooks/useStudentId';
import { useToast, type ToastData } from '../hooks/useToast';
import type { ClassSummary } from '../types';
import { formatDateTime, toBanglaNumber } from '../utils/format';
import { studentIdError } from '../utils/studentId';

function applyErrorToast(err: unknown, className: string): ToastData {
  if (isApiError(err) && err.status === 409 && err.title === 'No seats available') {
    return {
      variant: 'err',
      title: 'শেষ আসনটি এইমাত্র নেওয়া হয়ে গেছে',
      message: `অন্য একজন শিক্ষার্থী কিছুক্ষণ আগে "${className}" শ্রেণিতে আবেদন করেছে। আসন আগে আসলে আগে পাবেন ভিত্তিতে দেওয়া হয় — অন্য শ্রেণিতে চেষ্টা করুন।`,
    };
  }
  if (isApiError(err) && err.status === 409 && err.title === 'Application already exists') {
    return {
      variant: 'err',
      title: 'আবেদন আগে থেকেই আছে',
      message: `"${className}" শ্রেণিতে আপনার একটি সক্রিয় বা নিশ্চিত আবেদন আগে থেকেই আছে।`,
    };
  }
  return {
    variant: 'err',
    title: 'আবেদন করা যায়নি',
    message: isApiError(err) ? err.message : 'অজানা সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  };
}

function HomePage() {
  const { studentId, setStudentId, isValid } = useStudentId();
  const { classes, error, isLoading, refresh: refreshClasses } = useClasses();
  const { holdsByClass, refresh: refreshHolds } = useMyHolds(studentId, isValid);
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const [applyingClassId, setApplyingClassId] = useState<string | null>(null);
  const [studentIdRequired, setStudentIdRequired] = useState(false);
  const studentIdInputRef = useRef<HTMLInputElement>(null);

  const refreshAll = useCallback(() => {
    refreshClasses();
    refreshHolds();
  }, [refreshClasses, refreshHolds]);

  const handleApply = async (schoolClass: ClassSummary) => {
    const idError = studentIdError(studentId);
    if (idError) {
      setStudentIdRequired(true);
      studentIdInputRef.current?.focus();
      showToast({ variant: 'err', title: 'জন্ম নিবন্ধন নম্বর প্রয়োজন', message: idError });
      return;
    }

    setApplyingClassId(schoolClass.id);
    try {
      const hold = await createHold(schoolClass.id, studentId);
      showToast({
        variant: 'ok',
        title: `"${schoolClass.name}" শ্রেণিতে আসন সংরক্ষিত হয়েছে`,
        message: `নিশ্চিত করতে ${formatDateTime(hold.expiresAt)} এর মধ্যে ভর্তি ফি পরিশোধ করুন।`,
      });
    } catch (err) {
      showToast(applyErrorToast(err, schoolClass.name));
    } finally {
      setApplyingClassId(null);
      refreshAll();
    }
  };

  return (
    <>
      <TopBar />

      <main className="page">
        <div className="page-head">
          <h1>শ্রেণি ও আসনের অবস্থা</h1>
          <p className="lead">
            আসন আগে আসলে আগে পাবেন ভিত্তিতে দেওয়া হয়। আবেদন করলে আপনার জন্য একটি আসন নির্দিষ্ট সময়ের জন্য
            সংরক্ষিত থাকে — মেয়াদ শেষ হওয়ার আগে ভর্তি ফি পরিশোধ করে ভর্তি নিশ্চিত করুন।
          </p>
        </div>

        <StudentIdInput
          value={studentId}
          onChange={setStudentId}
          forceError={studentIdRequired}
          inputRef={studentIdInputRef}
        />

        {error && <Alert variant="error" message={`শ্রেণির তালিকা লোড করা যায়নি: ${error}`} />}

        {isLoading && <p className="empty">লোড হচ্ছে...</p>}

        {classes && (
          <>
            <div className="toolbar">
              <span className="hint">
                {toBanglaNumber(classes.length)}টি শ্রেণি দেখানো হচ্ছে · আসনের সংখ্যা প্রতি{' '}
                {toBanglaNumber(CLASSES_REFRESH_MS / 1000)} সেকেন্ডে হালনাগাদ হয়
              </span>
            </div>

            <ClassGrid
              classes={classes}
              holdsByClass={holdsByClass}
              applyingClassId={applyingClassId}
              onApply={handleApply}
              onHoldExpire={refreshAll}
            />
          </>
        )}
      </main>

      {toast && <Toast toast={toast} onClose={dismissToast} />}
    </>
  );
}

export default HomePage;
