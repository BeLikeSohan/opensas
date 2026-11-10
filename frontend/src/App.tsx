import { BrowserRouter, Route, Routes } from 'react-router';
import TopBar from './components/TopBar';
import HomePage from './pages/HomePage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
