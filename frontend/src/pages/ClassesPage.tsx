import { Component } from 'react';
import { createHold, getClasses, isValidStudentId, type SchoolClass } from '../api';

type Props = {
  studentId: string;
  onApplied: () => void; // called after a seat was held successfully
};

type State = {
  classes: SchoolClass[];
  loading: boolean;
  error: string;
  applyingClassId: string; // '' when no request is running
};

// Lists every class with its seat counts and an "Apply" button.
class ClassesPage extends Component<Props, State> {
  state: State = {
    classes: [],
    loading: true,
    error: '',
    applyingClassId: '',
  };

  timer: number | undefined;

  componentDidMount() {
    this.loadClasses();
    // Reload every 5 seconds so the seat counts stay up to date.
    this.timer = window.setInterval(this.loadClasses, 5000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  loadClasses = async () => {
    try {
      const classes = await getClasses();
      this.setState({ classes: classes, loading: false });
    } catch (e) {
      this.setState({ error: (e as Error).message, loading: false });
    }
  };

  apply = async (schoolClass: SchoolClass) => {
    if (!isValidStudentId(this.props.studentId)) {
      this.setState({ error: 'আবেদন করতে আগে সঠিক জন্ম নিবন্ধন নম্বর দিন।' });
      return;
    }

    this.setState({ applyingClassId: schoolClass.id, error: '' });
    try {
      await createHold(schoolClass.id, this.props.studentId);
      this.props.onApplied(); // go to "My applications" to pay
    } catch (e) {
      this.setState({ error: (e as Error).message, applyingClassId: '' });
      this.loadClasses();
    }
  };

  render() {
    const { classes, loading, error, applyingClassId } = this.state;

    return (
      <div>
        <h2>শ্রেণি ও আসনের অবস্থা</h2>
        <p className="hint">
          আবেদন করলে আপনার জন্য একটি আসন কিছু সময়ের জন্য সংরক্ষিত থাকে। সময় শেষ হওয়ার আগে ভর্তি ফি পরিশোধ করুন।
        </p>

        {error && <p className="error">{error}</p>}
        {loading && <p>লোড হচ্ছে...</p>}
        {!loading && classes.length === 0 && <p>এখনো কোনো শ্রেণি নেই।</p>}

        {classes.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>শ্রেণি</th>
                <th>মোট আসন</th>
                <th>নিশ্চিত</th>
                <th>সংরক্ষিত</th>
                <th>খালি</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.totalSeats}</td>
                  <td>{c.confirmedSeats}</td>
                  <td>{c.heldSeats}</td>
                  <td>{c.availableSeats}</td>
                  <td>
                    {c.availableSeats > 0 ? (
                      <button onClick={() => this.apply(c)} disabled={applyingClassId !== ''}>
                        {applyingClassId === c.id ? 'অপেক্ষা করুন...' : 'আবেদন করুন'}
                      </button>
                    ) : (
                      <span className="muted">আসন নেই</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default ClassesPage;
