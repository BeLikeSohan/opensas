import { Component } from 'react';
import { cancelHold, confirmHold, getMyHolds, isValidStudentId, type Hold } from '../api';
import Countdown from '../Countdown';

const STATUS_TEXT = {
  HELD: 'সংরক্ষিত',
  CONFIRMED: 'নিশ্চিত',
  EXPIRED: 'মেয়াদোত্তীর্ণ',
  CANCELLED: 'বাতিল',
};

type Props = {
  studentId: string;
};

type State = {
  holds: Hold[];
  error: string;
  message: string;
  busy: boolean; // true while a pay/cancel request is running
};

// Shows the student's applications. A HELD one has a timer and Pay / Cancel buttons.
class MyApplicationsPage extends Component<Props, State> {
  state: State = {
    holds: [],
    error: '',
    message: '',
    busy: false,
  };

  timer: number | undefined;

  componentDidMount() {
    this.loadHolds();
    // Reload every 5 seconds so status changes show up.
    this.timer = window.setInterval(this.loadHolds, 5000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  // Runs after every re-render. Reload when the student ID was changed.
  componentDidUpdate(prevProps: Props) {
    if (prevProps.studentId !== this.props.studentId) {
      this.loadHolds();
    }
  }

  loadHolds = async () => {
    if (!isValidStudentId(this.props.studentId)) {
      this.setState({ holds: [] });
      return;
    }
    try {
      const holds = await getMyHolds(this.props.studentId);
      this.setState({ holds: holds, error: '' });
    } catch (e) {
      this.setState({ error: (e as Error).message });
    }
  };

  pay = async (hold: Hold) => {
    this.setState({ busy: true, error: '', message: '' });
    try {
      await confirmHold(hold.holdId, this.props.studentId);
      this.setState({ message: '"' + hold.className + '" শ্রেণিতে ভর্তি নিশ্চিত হয়েছে।' });
    } catch (e) {
      this.setState({ error: (e as Error).message });
    }
    this.setState({ busy: false });
    this.loadHolds();
  };

  cancel = async (hold: Hold) => {
    if (!window.confirm('"' + hold.className + '" শ্রেণির আবেদন বাতিল করতে চান?')) {
      return;
    }
    this.setState({ busy: true, error: '', message: '' });
    try {
      await cancelHold(hold.holdId, this.props.studentId);
      this.setState({ message: 'আবেদন বাতিল করা হয়েছে।' });
    } catch (e) {
      this.setState({ error: (e as Error).message });
    }
    this.setState({ busy: false });
    this.loadHolds();
  };

  render() {
    const { holds, error, message, busy } = this.state;

    if (!isValidStudentId(this.props.studentId)) {
      return <p>আপনার আবেদনগুলো দেখতে উপরে জন্ম নিবন্ধন নম্বর দিন।</p>;
    }

    return (
      <div>
        <h2>আমার আবেদন</h2>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        {holds.length === 0 && <p>কোনো আবেদন নেই।</p>}

        {holds.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>শ্রেণি</th>
                <th>অবস্থা</th>
                <th>বাকি সময়</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {holds.map((hold) => (
                <tr key={hold.holdId}>
                  <td>{hold.className}</td>
                  <td>
                    <span className={'status status-' + hold.status}>{STATUS_TEXT[hold.status]}</span>
                  </td>
                  <td>
                    {hold.status === 'HELD' ? (
                      // When the timer hits 0, reload: the backend will now say EXPIRED.
                      <Countdown expiresAt={hold.expiresAt} onExpire={this.loadHolds} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {hold.status === 'HELD' && (
                      <>
                        <button onClick={() => this.pay(hold)} disabled={busy}>
                          ভর্তি ফি পরিশোধ করুন
                        </button>{' '}
                        <button className="secondary" onClick={() => this.cancel(hold)} disabled={busy}>
                          বাতিল করুন
                        </button>
                      </>
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

export default MyApplicationsPage;
