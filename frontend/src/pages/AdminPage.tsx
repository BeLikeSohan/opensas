import { Component, type FormEvent } from 'react';
import { createClass, getClasses, type SchoolClass } from '../api';

type State = {
  classes: SchoolClass[];
  name: string;
  seats: string;
  error: string;
  message: string;
};

class AdminPage extends Component<object, State> {
  state: State = {
    classes: [],
    name: '',
    seats: '',
    error: '',
    message: '',
  };

  timer: number | undefined;

  componentDidMount() {
    this.loadClasses();
    this.timer = window.setInterval(this.loadClasses, 5000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  loadClasses = async () => {
    try {
      const classes = await getClasses();
      this.setState({ classes: classes });
    } catch (e) {
      this.setState({ error: (e as Error).message });
    }
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const name = this.state.name.trim();
    const seats = Number(this.state.seats);
    if (name === '' || !Number.isInteger(seats) || seats < 1) {
      this.setState({ error: 'শ্রেণির নাম এবং ১ বা তার বেশি আসন সংখ্যা দিন।', message: '' });
      return;
    }

    try {
      await createClass(name, seats);
      this.setState({ name: '', seats: '', error: '', message: '"' + name + '" শ্রেণি যোগ করা হয়েছে।' });
      this.loadClasses();
    } catch (err) {
      this.setState({ error: (err as Error).message, message: '' });
    }
  };

  render() {
    const { classes, name, seats, error, message } = this.state;

    return (
      <div>
        <h2>নতুন শ্রেণি যোগ করুন</h2>
        <form className="box form" onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="class-name">শ্রেণির নাম</label>
            <input id="class-name" value={name} onChange={(e) => this.setState({ name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="class-seats">মোট আসন</label>
            <input
              id="class-seats"
              type="number"
              min={1}
              value={seats}
              onChange={(e) => this.setState({ seats: e.target.value })}
            />
          </div>
          <button type="submit">যোগ করুন</button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <h2>সব শ্রেণি</h2>
        {classes.length === 0 ? (
          <p>এখনো কোনো শ্রেণি নেই।</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>শ্রেণি</th>
                <th>মোট আসন</th>
                <th>নিশ্চিত</th>
                <th>সংরক্ষিত</th>
                <th>খালি</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default AdminPage;
