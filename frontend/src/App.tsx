import { Component } from 'react';
import { isValidStudentId } from './api';
import AdminPage from './pages/AdminPage';
import ClassesPage from './pages/ClassesPage';
import MyApplicationsPage from './pages/MyApplicationsPage';

type Page = 'classes' | 'my-applications' | 'admin';

type State = {
  page: Page;
  studentId: string;
};

// The root component. It remembers which page is open and the student ID.
class App extends Component<object, State> {
  state: State = {
    page: 'classes',
    // Keep the student ID in localStorage so it survives a page refresh.
    studentId: localStorage.getItem('studentId') || '',
  };

  changeStudentId = (value: string) => {
    localStorage.setItem('studentId', value);
    this.setState({ studentId: value });
  };

  goTo = (page: Page) => {
    this.setState({ page: page });
  };

  render() {
    const page = this.state.page;
    const studentId = this.state.studentId;
    const showIdError = studentId !== '' && !isValidStudentId(studentId);

    return (
      <div className="container">
        <header className="header">
          <h1>স্কুল ভর্তি</h1>
          <nav>
            <button className={page === 'classes' ? 'active' : ''} onClick={() => this.goTo('classes')}>
              শ্রেণিসমূহ
            </button>
            <button
              className={page === 'my-applications' ? 'active' : ''}
              onClick={() => this.goTo('my-applications')}
            >
              আমার আবেদন
            </button>
            <button className={page === 'admin' ? 'active' : ''} onClick={() => this.goTo('admin')}>
              অ্যাডমিন
            </button>
          </nav>
        </header>

        {page !== 'admin' && (
          <div className="box">
            <label htmlFor="student-id">শিক্ষার্থীর জন্ম নিবন্ধন নম্বর (১৭ সংখ্যা)</label>
            <input
              id="student-id"
              maxLength={17}
              value={studentId}
              onChange={(e) => this.changeStudentId(e.target.value.trim())}
            />
            {showIdError && <p className="error">জন্ম নিবন্ধন নম্বর অবশ্যই ১৭টি সংখ্যার হতে হবে।</p>}
          </div>
        )}

        {page === 'classes' && (
          <ClassesPage studentId={studentId} onApplied={() => this.goTo('my-applications')} />
        )}
        {page === 'my-applications' && <MyApplicationsPage studentId={studentId} />}
        {page === 'admin' && <AdminPage />}
      </div>
    );
  }
}

export default App;
