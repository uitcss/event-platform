import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Navbar from './Components/Navbar/Navbar';
import Home from './Pages/Home/Home';
import './App.css';
import About from './Pages/About/About';
import Test from './Pages/Test/Test';
import Contest from './Pages/Contest/Contest';
import { useEffect, useState, useCallback, useRef } from 'react';
import './Theme.css'

function App() {
  const apiUrl = 'http://localhost:4000';
  const location = useLocation();

  const [showNavbar, setShowNavbar] = useState(true);
  const prevPathRef = useRef('');

  //Centralized cleanup function
  const clearUserData = useCallback(() => {
    localStorage.removeItem('userId');
    localStorage.removeItem('testStartTime');
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('markedForReview');
  }, []);

  //logout function
  const handleLogout = useCallback(async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id) return;

    try {
      await axios.post(`${apiUrl}/api/test/logout`, { user_id });
      toast.success('You have been logged out successfully.');
    } catch (error) {
      console.error('Error during logout:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Logout failed on server.');
      } else {
        toast.error('Network error during logout.');
      }
    } finally {
      clearUserData();
    }
  }, [apiUrl, clearUserData]);

  //Handle route changes (using ref for previous path)
  useEffect(() => {
    const currentPath = location.pathname;
    const isTestRoute = currentPath.startsWith('/test');
    const wasTestRoute = prevPathRef.current.startsWith('/test');

    // Hide navbar only on test route
    setShowNavbar(!isTestRoute);

    // If navigating away from test route, logout
    if (wasTestRoute && !isTestRoute) {
      handleLogout();
    }

    // Update prevPath reference
    prevPathRef.current = currentPath;
  }, [location.pathname, handleLogout]);

  // Handle page refresh, tab close, or browser navigation safely
  useEffect(() => {
    let isLoggingOut = false; // prevent double logout

    const handleSafeLogout = async () => {
      const user_id = localStorage.getItem('userId');
      if (!user_id || !window.location.pathname.startsWith('/test') || isLoggingOut)
        return;

      isLoggingOut = true;
      try {
        // Prepare JSON data
        const body = JSON.stringify({ user_id });
        const blob = new Blob([body], { type: 'application/json' });

        // Try sendBeacon first (non-blocking)
        const success = navigator.sendBeacon(`${apiUrl}/api/test/logout`, blob);

        // Fallback to fetch(keepalive)
        if (!success) {
          fetch(`${apiUrl}/api/test/logout`, {
            method: 'POST',
            body,
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => { });
        }
      } catch (err) {
        console.error('Logout during unload failed:', err);
      } finally {
        clearUserData();
        isLoggingOut = false;
      }
    };

    // Triggered on refresh or tab close
    const handleBeforeUnload = () => {
      handleSafeLogout();
    };

    // Triggered on browser back/forward navigation
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/test')) {
        handleLogout(); // normal logout
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);

      // Detect hard refresh using modern API
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length && navEntries[0].type === 'reload') {
        const user_id = localStorage.getItem('userId');
        if (user_id && window.location.pathname.startsWith('/test')) {
          fetch(`${apiUrl}/api/test/logout`, {
            method: 'POST',
            body: JSON.stringify({ user_id }),
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
          }).catch(console.error);
          clearUserData();
        }
      }
    };
  }, [apiUrl, clearUserData, handleLogout]);


  //axios global error interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.response) {
          toast.error('Network issue. Please check your connection.');
        } else if (error.response.status >= 500) {
          toast.error('Server error occurred.');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <>
      <div className="app">

        {showNavbar && <Navbar apiUrl={apiUrl} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contest" element={<Contest apiUrl={apiUrl} />} />
          <Route path="/test" element={<Test apiUrl={apiUrl}/>} />
        </Routes>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
