import { useState } from 'react';
import { createHold, isApiError } from '../api';
import Alert from '../components/Alert';
import ClassList from '../components/ClassList';
import StudentIdInput from '../components/StudentIdInput';
import { useClasses } from '../hooks/useClasses';
import { useStudentId } from '../hooks/useStudentId';
import type { ClassSummary } from '../types';
import { formatDateTime } from '../utils/format';

interface Notice {
  variant: 'success' | 'error';
  message: string;
}

function HomePage() {
  const { studentId, setStudentId, isValid } = useStudentId();
  const { classes, error, isLoading, refresh } = useClasses();
  const [applyingClassId, setApplyingClassId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleApply = async (schoolClass: ClassSummary) => {
    setApplyingClassId(schoolClass.id);
    setNotice(null);
    try {
      const hold = await createHold(schoolClass.id, studentId);
      setNotice({
        variant: 'success',
        message: `"${schoolClass.name}" শ্রেণিতে আপনার জন্য একটি আসন সংরক্ষিত হয়েছে। ${formatDateTime(hold.expiresAt)} এর মধ্যে ভর্তি ফি পরিশোধ করুন।`,
      });
    } catch (err) {
      setNotice({
        variant: 'error',
        message: `আবেদন করা যায়নি: ${isApiError(err) ? err.message : 'অজানা সমস্যা হয়েছে।'}`,
      });
    } finally {
      setApplyingClassId(null);
      refresh();
    }
  };

  return (
    <main className="page">
      <header className="page-header">
        <h1>স্কুল ভর্তি</h1>
        <p>আগে আসলে আগে পাবেন ভিত্তিতে আসন বরাদ্দ করা হয়।</p>
      </header>

      <StudentIdInput value={studentId} isValid={isValid} onChange={setStudentId} />

      {notice && (
        <Alert variant={notice.variant} message={notice.message} onClose={() => setNotice(null)} />
      )}

      <section className="card">
        <div className="card-header">
          <h2>শ্রেণির তালিকা</h2>
          <span className="hint">আসনের সংখ্যা প্রতি কয়েক সেকেন্ডে হালনাগাদ হয়</span>
        </div>

        {error && <Alert variant="error" message={`শ্রেণির তালিকা লোড করা যায়নি: ${error}`} />}

        {isLoading && <p className="empty">লোড হচ্ছে...</p>}

        {classes && (
          <ClassList
            classes={classes}
            canApply={isValid}
            applyingClassId={applyingClassId}
            onApply={handleApply}
          />
        )}
      </section>
    </main>
  );
}

export default HomePage;
