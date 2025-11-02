import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Navbar from './Components/Navbar/Navbar';
import Home from './pages/Home/Home';
import './App.css';
import Register from './Pages/Register/Register';


function App() {
  const apiUrl = 'http://localhost:4000';

  return (
    <AuthProvider apiUrl={apiUrl}>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register apiUrl={apiUrl}/>} />
        </Routes>
      </div>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App
