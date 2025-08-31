import React, { useState } from 'react';
import api from '../services/api';
import './AuthPage.css';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // <-- Add this line

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                const response = await api.post('/register/', { username, email, password });
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('user_id', response.data.user_id);
                onLogin(response.data.access);
                navigate('/'); // <-- Add this line for redirection
            } else {
                const response = await api.post('/token/', { username, password });
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                const userDetails = await api.get(`/users/?username=${username}`);
                if (userDetails.data && userDetails.data.length > 0) {
                    localStorage.setItem('user_id', userDetails.data[0].id);
                } else {
                    setError('User not found. Please check your username.');
                    return;
                }
                onLogin(response.data.access);
                navigate('/'); // <-- Add this line for redirection
            }
        } catch (err) {
            console.error(err.response);
            if (err.response && err.response.data) {
                if (err.response.status === 400) {
                    // Handle validation errors
                    const errorData = err.response.data;
                    if (typeof errorData === 'object') {
                        const errorMessages = Object.entries(errorData).map(([field, errors]) => 
                            `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
                        ).join('; ');
                        setError(`Validation error: ${errorMessages}`);
                    } else {
                        setError(`Error: ${errorData}`);
                    }
                } else if (err.response.status === 404) {
                    setError('User not found. Please check your username.');
                } else {
                    setError('Login or registration failed. Please check your credentials.');
                }
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isRegistering ? 'Create an Account' : 'Log In'}</h2>
                {error && <p className="auth-error">{error}</p>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        className="auth-input"
                    />
                    {isRegistering && (
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="auth-input"
                        />
                    )}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="auth-input"
                    />
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Log In')}
                    </button>
                </form>
                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="toggle-button"
                >
                    {isRegistering
                        ? 'Already have an account? Log In'
                        : "Don't have an account? Register"}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;