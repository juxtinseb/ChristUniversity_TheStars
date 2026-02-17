import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, BookOpen, Heart, Download, Bookmark,
    Settings, LogOut, GraduationCap, Building2, Lock, Globe, Star
} from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { RESOURCE_TYPES } from '../data/mockData';
import './Profile.css';

export default function Profile() {
    const { user, isAuthenticated, logout, setShowAuthModal } = useAuth();
    const { resources, bookmarks, getAverageRating, getReviewsForResource } = useResources();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('uploads');

    if (!isAuthenticated) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="profile-auth glass">
                        <User size={40} />
                        <h2>Sign in to view your profile</h2>
                        <p>Access your uploaded resources and settings.</p>
                        <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                            Sign In / Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const myResources = resources.filter(r => r.author === user.name);
    const totalLikes = myResources.reduce((a, r) => a + (r.likes || 0), 0);
    const totalDownloads = myResources.reduce((a, r) => a + (r.downloads || 0), 0);

    return (
        <div className="profile-page">
            <div className="container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="profile-layout">
                        {/* User Card */}
                        <aside className="profile-sidebar">
                            <div className="user-card glass">
                                <div className="user-avatar-lg">
                                    {user.name.charAt(0)}
                                </div>
                                <h2 className="user-name">{user.name}</h2>
                                <p className="user-email">{user.email}</p>
                                {user.college && (
                                    <div className="user-college"><Building2 size={14} /> {user.college}</div>
                                )}

                                <div className="user-stats">
                                    <div className="user-stat">
                                        <span className="user-stat-value">{myResources.length}</span>
                                        <span className="user-stat-label">Uploads</span>
                                    </div>
                                    <div className="user-stat">
                                        <span className="user-stat-value">{totalLikes}</span>
                                        <span className="user-stat-label">Likes</span>
                                    </div>
                                    <div className="user-stat">
                                        <span className="user-stat-value">{totalDownloads}</span>
                                        <span className="user-stat-label">Downloads</span>
                                    </div>
                                </div>

                                <button className="btn btn-ghost logout-btn" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="profile-main">
                            <div className="profile-tabs">
                                <button className={`profile-tab ${activeTab === 'uploads' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('uploads')}>
                                    <BookOpen size={16} /> My Uploads
                                </button>
                                <button className={`profile-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('bookmarks')}>
                                    <Bookmark size={16} /> Bookmarks
                                </button>
                            </div>

                            {activeTab === 'uploads' ? (
                                myResources.length > 0 ? (
                                    <div className="profile-resources-list">
                                        {myResources.map(r => {
                                            const typeInfo = RESOURCE_TYPES.find(t => t.id === r.type) || RESOURCE_TYPES[0];
                                            const avgRating = getAverageRating(r.id);
                                            return (
                                                <Link key={r.id} to={`/resource/${r.id}`} className="profile-resource-item glass">
                                                    <div className="pri-header">
                                                        <div className="pri-type" style={{ color: typeInfo.color }}>{typeInfo.label}</div>
                                                        <div className={`privacy-badge ${r.privacy === 'private' ? 'private' : 'public'}`}>
                                                            {r.privacy === 'private' ? <Lock size={11} /> : <Globe size={11} />}
                                                            {r.privacy === 'private' ? 'Private' : 'Public'}
                                                        </div>
                                                    </div>
                                                    <h3 className="pri-title">{r.title}</h3>
                                                    <p className="pri-subject">{r.subject}</p>
                                                    {r.branch && <p className="pri-branch"><GraduationCap size={12} /> {r.branch}</p>}
                                                    <div className="pri-stats">
                                                        <span><Heart size={12} /> {r.likes}</span>
                                                        <span><Download size={12} /> {r.downloads}</span>
                                                        {avgRating > 0 && <span><Star size={12} /> {avgRating}</span>}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="profile-empty glass">
                                        <BookOpen size={32} />
                                        <h3>No uploads yet</h3>
                                        <p>Share your academic resources with the community</p>
                                        <Link to="/upload" className="btn btn-primary">Upload Resource</Link>
                                    </div>
                                )
                            ) : (
                                <div className="profile-empty glass">
                                    <Bookmark size={32} />
                                    <h3>{bookmarks.length > 0 ? `${bookmarks.length} bookmarked` : 'No bookmarks yet'}</h3>
                                    <p>Browse and bookmark resources to find them later</p>
                                    <Link to="/browse" className="btn btn-primary">Browse Resources</Link>
                                </div>
                            )}
                        </main>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
