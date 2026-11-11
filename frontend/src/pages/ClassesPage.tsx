import { Component } from 'react';
import { createHold, getClasses, getMyHolds, isValidStudentId, type Hold, type SchoolClass } from '../api';

type Props = {
  studentId: string;
  onApplied: () => void;
};

type State = {
  classes: SchoolClass[];
  myHolds: Hold[];
  loading: boolean;
  error: string;
  applyingClassId: string;
};

class ClassesPage extends Component<Props, State> {
  state: State = {
    classes: [],
    myHolds: [],
    loading: true,
    error: '',
    applyingClassId: '',
  };

  timer: number | undefined;

  componentDidMount() {
    this.loadData();
    this.timer = window.setInterval(this.loadData, 5000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.studentId !== this.props.studentId) {
      this.loadData();
    }
  }

  loadData = async () => {
    try {
      const classes = await getClasses();
      let myHolds: Hold[] = [];
      if (isValidStudentId(this.props.studentId)) {
        myHolds = await getMyHolds(this.props.studentId);
      }
      this.setState({ classes: classes, myHolds: myHolds, loading: false });
    } catch (e) {
      this.setState({ error: (e as Error).message, loading: false });
    }
  };

  findActiveHold(classId: string): Hold | undefined {
    return this.state.myHolds.find(
      (hold) => hold.classId === classId && (hold.status === 'HELD' || hold.status === 'CONFIRMED'),
    );
  }

  apply = async (schoolClass: SchoolClass) => {
    if (!isValidStudentId(this.props.studentId)) {
      this.setState({ error: 'আবেদন করতে আগে সঠিক জন্ম নিবন্ধন নম্বর দিন।' });
      return;
    }

    this.setState({ applyingClassId: schoolClass.id, error: '' });
    try {
      await createHold(schoolClass.id, this.props.studentId);
      this.props.onApplied();
    } catch (e) {
      this.setState({ error: (e as Error).message, applyingClassId: '' });
      this.loadData();
    }
  };

  renderAction(c: SchoolClass) {
    const activeHold = this.findActiveHold(c.id);

    if (activeHold && activeHold.status === 'CONFIRMED') {
      return <span className="success">ভর্তি নিশ্চিত</span>;
    }
    if (activeHold && activeHold.status === 'HELD') {
      return <span className="muted">আবেদন করা হয়েছে</span>;
    }
    if (c.availableSeats <= 0) {
      return <span className="muted">আসন নেই</span>;
    }
    return (
      <button onClick={() => this.apply(c)} disabled={this.state.applyingClassId !== ''}>
        {this.state.applyingClassId === c.id ? 'অপেক্ষা করুন...' : 'আবেদন করুন'}
      </button>
    );
  }

  render() {
    const { classes, loading, error } = this.state;

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
                  <td>{this.renderAction(c)}</td>
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
