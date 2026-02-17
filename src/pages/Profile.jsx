import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Calendar, LogOut, Upload, Bookmark, Building2,
    Trash2, BookOpen, FileText, FolderKanban, Library,
    ClipboardList, GraduationCap, Lock, Globe, Heart, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { RESOURCE_TYPES } from '../data/mockData';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

const iconMap = {
    BookOpen, FileText, FolderKanban, Library, ClipboardList, GraduationCap,
};

export default function Profile() {
    const { user, isAuthenticated, logout, setShowAuthModal } = useAuth();
    const { resources, deleteResource, getBookmarkedResources } = useResources();
    const navigate = useNavigate();
    const [tab, setTab] = useState('uploads');

    if (!isAuthenticated) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="auth-required glass">
                        <User size={48} className="auth-icon" />
                        <h2>Login Required</h2>
                        <p>Log in to view your profile.</p>
                        <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                            Log In / Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const myUploads = resources.filter(r => r.author === user.name);
    const bookmarked = getBookmarkedResources();
    const totalDownloads = myUploads.reduce((s, r) => s + r.downloads, 0);
    const totalLikes = myUploads.reduce((s, r) => s + r.likes, 0);

    const handleLogout = () => { logout(); navigate('/'); };

    const handleDelete = (id) => {
        if (window.confirm('Delete this resource?')) deleteResource(id);
    };

    const activeList = tab === 'uploads' ? myUploads : bookmarked;

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-layout">
                    {/* User Card */}
                    <motion.aside
                        className="user-card glass"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="user-avatar-lg" style={{ background: 'var(--accent-primary)' }}>
                            {user.name.charAt(0)}
                        </div>
                        <h2 className="user-name">{user.name}</h2>

                        <div className="user-detail">
                            <Mail size={14} />
                            <span>{user.email}</span>
                        </div>
                        <div className="user-detail">
                            <Building2 size={14} />
                            <span>{user.college || 'Not specified'}</span>
                        </div>
                        <div className="user-detail">
                            <Calendar size={14} />
                            <span>Joined {formatDate(user.joinedAt)}</span>
                        </div>

                        <div className="user-stats">
                            <div className="user-stat">
                                <Upload size={16} />
                                <span className="stat-value">{myUploads.length}</span>
                                <span className="stat-label">Uploads</span>
                            </div>
                            <div className="user-stat">
                                <Heart size={16} />
                                <span className="stat-value">{totalLikes}</span>
                                <span className="stat-label">Likes</span>
                            </div>
                            <div className="user-stat">
                                <Download size={16} />
                                <span className="stat-value">{totalDownloads}</span>
                                <span className="stat-label">Downloads</span>
                            </div>
                        </div>

                        <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                            <LogOut size={16} /> Log Out
                        </button>
                    </motion.aside>

                    {/* Content Area */}
                    <motion.div
                        className="profile-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="profile-tabs">
                            <button className={`profile-tab ${tab === 'uploads' ? 'active' : ''}`} onClick={() => setTab('uploads')}>
                                <Upload size={16} />
                                My Uploads ({myUploads.length})
                            </button>
                            <button className={`profile-tab ${tab === 'bookmarks' ? 'active' : ''}`} onClick={() => setTab('bookmarks')}>
                                <Bookmark size={16} />
                                Bookmarks ({bookmarked.length})
                            </button>
                        </div>

                        {activeList.length > 0 ? (
                            <div className="profile-list">
                                {activeList.map((r, i) => {
                                    const typeInfo = RESOURCE_TYPES.find(t => t.id === r.type) || RESOURCE_TYPES[0];
                                    const TypeIcon = iconMap[typeInfo.icon] || BookOpen;
                                    const isPrivate = r.privacy === 'private';

                                    return (
                                        <motion.div
                                            key={r.id}
                                            className="profile-item glass"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                        >
                                            <Link to={`/resource/${r.id}`} className="profile-item-link">
                                                <div className="profile-item-icon" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>
                                                    <TypeIcon size={20} />
                                                </div>
                                                <div className="profile-item-info">
                                                    <div className="profile-item-header">
                                                        <h4>{r.title}</h4>
                                                        <div className={`profile-privacy ${isPrivate ? 'private' : 'public'}`}>
                                                            {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                                                            {isPrivate ? 'Private' : 'Public'}
                                                        </div>
                                                    </div>
                                                    <div className="profile-item-meta">
                                                        <span>{r.subject}</span>
                                                        <span>·</span>
                                                        <span>{typeInfo.label}</span>
                                                        {r.branch && (<><span>·</span><span>{r.branch}</span></>)}
                                                        <span>·</span>
                                                        <span>{formatDate(r.createdAt)}</span>
                                                    </div>
                                                    <div className="profile-item-stats">
                                                        <span><Heart size={12} /> {r.likes}</span>
                                                        <span><Download size={12} /> {r.downloads}</span>
                                                        {r.rating > 0 && <span>⭐ {r.rating}</span>}
                                                    </div>
                                                </div>
                                            </Link>
                                            {tab === 'uploads' && (
                                                <button className="delete-btn" title="Delete" onClick={() => handleDelete(r.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state glass">
                                {tab === 'uploads' ? <Upload size={40} /> : <Bookmark size={40} />}
                                <h3>{tab === 'uploads' ? 'No Uploads Yet' : 'No Bookmarks Yet'}</h3>
                                <p>
                                    {tab === 'uploads'
                                        ? 'Start sharing resources with the community!'
                                        : 'Bookmark resources to save them for later.'}
                                </p>
                                {tab === 'uploads' && (
                                    <Link to="/upload" className="btn btn-primary">Upload Resource</Link>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
