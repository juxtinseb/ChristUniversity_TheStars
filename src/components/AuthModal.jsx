import { useState } from 'react';
import { X, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
    const [tab, setTab] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, signup } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tab === 'login') {
            login(email, password);
        } else {
            signup(name, email, password);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-modal glass" onClick={e => e.stopPropagation()}>
                <button className="modal-close btn btn-ghost btn-icon" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <GraduationCap size={36} className="modal-icon" />
                    <h2 className="modal-title">
                        {tab === 'login' ? 'Welcome Back!' : 'Join CampusShare'}
                    </h2>
                    <p className="modal-subtitle">
                        {tab === 'login'
                            ? 'Log in to access and share resources'
                            : 'Create an account to start sharing'}
                    </p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                        onClick={() => setTab('login')}
                    >
                        Log In
                    </button>
                    <button
                        className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                        onClick={() => setTab('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {tab === 'signup' && (
                        <div className="input-group">
                            <label htmlFor="auth-name">Full Name</label>
                            <div className="input-with-icon">
                                <User size={18} />
                                <input
                                    id="auth-name"
                                    type="text"
                                    className="input-field"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="auth-email">Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                id="auth-email"
                                type="email"
                                className="input-field"
                                placeholder="you@campus.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="auth-password">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                id="auth-password"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit">
                        {tab === 'login' ? 'Log In' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        className="switch-btn"
                        onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
                    >
                        {tab === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
}
