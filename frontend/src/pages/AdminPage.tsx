import { useState } from 'react';
import AdminClassTable from '../components/AdminClassTable';
import Alert from '../components/Alert';
import CreateClassForm from '../components/CreateClassForm';
import Toast from '../components/Toast';
import { CLASSES_REFRESH_MS, useClasses } from '../hooks/useClasses';
import { useToast } from '../hooks/useToast';
import type { ClassResponse } from '../types';
import { toBanglaNumber } from '../utils/format';

/** অ্যাডমিন: create classes and see every class with live seat counts. */
function AdminPage() {
  const { classes, error, isLoading, refresh } = useClasses();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const handleCreated = (created: ClassResponse) => {
    setLastCreatedId(created.id);
    showToast({
      variant: 'ok',
      title: 'শ্রেণি যোগ করা হয়েছে',
      message: `"${created.name}" শ্রেণিতে মোট ${toBanglaNumber(created.totalSeats)}টি আসন রয়েছে।`,
    });
    refresh();
  };

  return (
    <main className="page">
      <div className="page-head">
        <h1>অ্যাডমিন</h1>
        <p className="lead">নতুন শ্রেণি যোগ করুন এবং সব শ্রেণির আসনের অবস্থা দেখুন।</p>
      </div>

      <CreateClassForm onCreated={handleCreated} />

      <div className="toolbar">
        <h2 className="section-title">সব শ্রেণি</h2>
        <span className="hint">
          {classes ? `${toBanglaNumber(classes.length)}টি শ্রেণি · ` : ''}আসনের সংখ্যা প্রতি{' '}
          {toBanglaNumber(CLASSES_REFRESH_MS / 1000)} সেকেন্ডে হালনাগাদ হয়
        </span>
      </div>

      {error && <Alert variant="error" message={`শ্রেণির তালিকা লোড করা যায়নি: ${error}`} />}
      {isLoading && <p className="empty">লোড হচ্ছে...</p>}
      {classes && <AdminClassTable classes={classes} highlightId={lastCreatedId} />}

      {toast && <Toast toast={toast} onClose={dismissToast} />}
    </main>
  );
}

export default AdminPage;
