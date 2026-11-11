import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Render the App component into <div id="root"> from index.html.
createRoot(document.getElementById('root')!).render(<App />);
