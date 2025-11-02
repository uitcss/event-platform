import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Route, Routes, useLocation, Navigate, Outlet } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Sidebar from './Components/Sidebar/Sidebar';
import Login from './pages/Login/Login';
import EventSettings from './pages/EventSettings/EventSettings';
import RoundsManagement from './pages/RoundsManagement/RoundsManagement';
import UploadQuestions from './pages/UploadQuestions/UploadQuestions';
import UserManagement from './pages/UserManagement/UserManagement';
import ValidatingAnswers from './pages/ValidatingAnswers/ValidatingAnswers';
import Results from './pages/Results/Results';
import AdminManagement from './pages/AdminManagement/AdminManagement';
import { useAuth } from './Context/adminAuthContext';
import AddUsers from './pages/AddUsers/AddUsers';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  return (
    <div className="app">
      {!isLoginPage && <Navbar />}
      <div >
        {!isLoginPage && <Sidebar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><EventSettings /></ProtectedRoute>} />
          <Route path="/eventsettings" element={<ProtectedRoute><EventSettings /></ProtectedRoute>} />
          <Route path="/rounds" element={<ProtectedRoute><RoundsManagement /></ProtectedRoute>} />
          <Route path="/questions/:roundId?" element={<ProtectedRoute><UploadQuestions /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/answers" element={<ProtectedRoute><ValidatingAnswers /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminManagement /></ProtectedRoute>} />
          <Route path="/addusers" element={<ProtectedRoute><AddUsers /></ProtectedRoute>} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;