import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Upload, GraduationCap, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, isAuthenticated, logout, setShowAuthModal } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setMobileOpen(false);
        }
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/browse', label: 'Browse' },
        { to: '/upload', label: 'Upload', icon: <Upload size={16} /> },
    ];

    return (
        <nav className="navbar glass">
            <div className="navbar-inner container">
                <Link to="/" className="navbar-logo">
                    <GraduationCap size={28} strokeWidth={2.5} />
                    <span className="logo-text">
                        Campus<span className="gradient-text">Share</span>
                    </span>
                </Link>

                <div className={`navbar-center ${mobileOpen ? 'open' : ''}`}>
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </form>

                    <div className="nav-links">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.icon}
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="nav-auth">
                        {isAuthenticated ? (
                            <div className="user-menu">
                                <Link to="/profile" className="user-info" onClick={() => setMobileOpen(false)}>
                                    <div className="user-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name">{user.name}</span>
                                </Link>
                                <button className="btn btn-ghost btn-icon" onClick={logout} title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <button className="btn btn-ghost" onClick={() => setShowAuthModal(true)}>
                                    Log In
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="mobile-toggle btn btn-icon"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
}
