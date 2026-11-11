import { Component } from 'react';

type Props = {
  expiresAt: string; // ISO date from the backend
  onExpire: () => void; // called once when the time runs out
};

type State = {
  secondsLeft: number;
};

function secondsUntil(isoDate: string): number {
  const ms = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

// Shows "mm:ss" and counts down once per second.
class Countdown extends Component<Props, State> {
  timer: number | undefined;

  constructor(props: Props) {
    super(props);
    this.state = { secondsLeft: secondsUntil(props.expiresAt) };
  }

  // Runs once, when the component appears on screen.
  componentDidMount() {
    this.timer = window.setInterval(this.tick, 1000);
  }

  // Runs once, when the component is removed from the screen.
  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  tick = () => {
    const secondsLeft = secondsUntil(this.props.expiresAt);
    this.setState({ secondsLeft: secondsLeft });

    if (secondsLeft === 0) {
      window.clearInterval(this.timer);
      this.props.onExpire();
    }
  };

  render() {
    const minutes = Math.floor(this.state.secondsLeft / 60);
    const seconds = this.state.secondsLeft % 60;
    const text = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

    return <span className="countdown">{text}</span>;
  }
}

export default Countdown;
