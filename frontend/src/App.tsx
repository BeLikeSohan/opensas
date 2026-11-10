import { BrowserRouter, Route, Routes } from 'react-router';
import TopBar from './components/TopBar';
import AdminPage from './pages/AdminPage';
import ApplicationPage from './pages/ApplicationPage';
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
        <Route path="/applications/:holdId" element={<ApplicationPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
