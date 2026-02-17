import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Calendar, Upload, Bookmark, Trash2,
    LogOut, FileText, Heart, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { RESOURCE_TYPES } from '../data/mockData';
import './Profile.css';

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuth();
    const { resources, getBookmarkedResources, deleteResource } = useResources();
    const [activeTab, setActiveTab] = useState('uploads');

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const myUploads = resources.filter(r => r.author === user.name);
    const bookmarked = getBookmarkedResources();

    const currentList = activeTab === 'uploads' ? myUploads : bookmarked;

    const getTypeInfo = (type) => {
        return RESOURCE_TYPES.find(t => t.id === type) || RESOURCE_TYPES[0];
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-layout">
                    {/* User Card */}
                    <motion.aside
                        className="profile-sidebar"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="user-card glass">
                            <div className="profile-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="profile-name">{user.name}</h2>
                            <div className="profile-info">
                                <span className="profile-detail">
                                    <Mail size={14} /> {user.email}
                                </span>
                                <span className="profile-detail">
                                    <Calendar size={14} /> Joined {formatDate(user.joinedAt)}
                                </span>
                            </div>

                            <div className="profile-stats-grid">
                                <div className="profile-stat">
                                    <span className="stat-val">{myUploads.length}</span>
                                    <span className="stat-lbl">Uploads</span>
                                </div>
                                <div className="profile-stat">
                                    <span className="stat-val">{bookmarked.length}</span>
                                    <span className="stat-lbl">Bookmarks</span>
                                </div>
                            </div>

                            <Link to="/upload" className="btn btn-primary profile-upload-btn">
                                <Upload size={16} /> Upload New
                            </Link>
                            <button className="btn btn-ghost profile-logout" onClick={logout}>
                                <LogOut size={16} /> Log Out
                            </button>
                        </div>
                    </motion.aside>

                    {/* Content */}
                    <motion.div
                        className="profile-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <div className="profile-tabs">
                            <button
                                className={`profile-tab ${activeTab === 'uploads' ? 'active' : ''}`}
                                onClick={() => setActiveTab('uploads')}
                            >
                                <Upload size={16} />
                                My Uploads ({myUploads.length})
                            </button>
                            <button
                                className={`profile-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
                                onClick={() => setActiveTab('bookmarks')}
                            >
                                <Bookmark size={16} />
                                Bookmarks ({bookmarked.length})
                            </button>
                        </div>

                        <div className="profile-list">
                            {currentList.length > 0 ? (
                                currentList.map((resource, i) => {
                                    const typeInfo = getTypeInfo(resource.type);
                                    return (
                                        <motion.div
                                            key={resource.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                        >
                                            <Link to={`/resource/${resource.id}`} className="profile-item glass">
                                                <div className="item-icon" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="item-info">
                                                    <h4 className="item-title">{resource.title}</h4>
                                                    <div className="item-meta">
                                                        <span className="tag tag-primary">{resource.subject}</span>
                                                        <span className="item-date">{formatDate(resource.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div className="item-stats">
                                                    <span className="item-stat"><Heart size={12} /> {resource.likes}</span>
                                                    <span className="item-stat"><Download size={12} /> {resource.downloads}</span>
                                                </div>
                                                {activeTab === 'uploads' && (
                                                    <button
                                                        className="btn btn-ghost btn-icon item-delete"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteResource(resource.id); }}
                                                        title="Delete resource"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="profile-empty glass">
                                    {activeTab === 'uploads' ? (
                                        <>
                                            <Upload size={40} className="empty-icon" />
                                            <h3>No uploads yet</h3>
                                            <p>Share your first resource with the community!</p>
                                            <Link to="/upload" className="btn btn-primary">Upload Now</Link>
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark size={40} className="empty-icon" />
                                            <h3>No bookmarks yet</h3>
                                            <p>Start bookmarking resources to find them here</p>
                                            <Link to="/browse" className="btn btn-primary">Browse Resources</Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
