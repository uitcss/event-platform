import React, { useEffect, useState } from 'react';
import "./Login.css";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/adminAuthContext';
import api from '../../api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { isAuthed, login } = useAuth();

    useEffect(() => {
        if (isAuthed) navigate('/users', { replace: true });
    }, [isAuthed, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post('/adminauth/login', { email, password });
            if (response.data.token) {
                login(response.data.token);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2 className="login-title">Admin Login</h2>


                <label className="login-label">Email</label>
                <input
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                />

                <label className="login-label">Password</label>
                <div className="login-password-container">
                    <div className="login-password-input-wrapper">
                        <input
                            className="login-password-input"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                        <button 
                            type="button" 
                            className="login-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                <button className="login-button" type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}

export default Login
