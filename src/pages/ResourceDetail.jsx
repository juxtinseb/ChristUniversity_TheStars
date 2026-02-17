import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Heart, Download, Bookmark, Calendar, User,
    BookOpen, FileText, FolderKanban, Library, ClipboardList,
    GraduationCap, Share2, Eye
} from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { RESOURCE_TYPES } from '../data/mockData';
import ResourceCard from '../components/ResourceCard';
import './ResourceDetail.css';

const iconMap = {
    BookOpen, FileText, FolderKanban, Library, ClipboardList, GraduationCap,
};

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getResourceById, likeResource, downloadResource, toggleBookmark, isBookmarked, searchResources } = useResources();
    const { isAuthenticated, setShowAuthModal } = useAuth();

    const resource = getResourceById(id);

    if (!resource) {
        return (
            <div className="detail-page">
                <div className="container">
                    <div className="not-found glass">
                        <h2>Resource Not Found</h2>
                        <p>The resource you're looking for doesn't exist or has been removed.</p>
                        <Link to="/browse" className="btn btn-primary">Browse Resources</Link>
                    </div>
                </div>
            </div>
        );
    }

    const typeInfo = RESOURCE_TYPES.find(t => t.id === resource.type) || RESOURCE_TYPES[0];
    const TypeIcon = iconMap[typeInfo.icon] || BookOpen;
    const bookmarked = isBookmarked(resource.id);

    const relatedResources = searchResources('', { subject: resource.subject })
        .filter(r => r.id !== resource.id)
        .slice(0, 3);

    const handleLike = () => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        likeResource(resource.id);
    };

    const handleDownload = () => {
        downloadResource(resource.id);
    };

    const handleBookmark = () => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        toggleBookmark(resource.id);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="detail-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Back
                    </button>

                    <div className="detail-layout">
                        {/* Main Content */}
                        <div className="detail-main">
                            <div className="detail-card glass">
                                <div className="detail-header">
                                    <div className="detail-type-badge" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>
                                        <TypeIcon size={16} />
                                        {typeInfo.label}
                                    </div>
                                    {resource.semester && (
                                        <span className="tag tag-blue">{resource.semester} Sem</span>
                                    )}
                                    {resource.year && (
                                        <span className="tag tag-green">{resource.year}</span>
                                    )}
                                </div>

                                <h1 className="detail-title">{resource.title}</h1>

                                <div className="detail-meta">
                                    <div className="detail-author">
                                        <div className="detail-avatar" style={{ background: typeInfo.color }}>
                                            {resource.author.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="detail-author-name">{resource.author}</span>
                                            <span className="detail-date">
                                                <Calendar size={12} /> {formatDate(resource.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="detail-subject tag tag-primary">{resource.subject}</div>
                                </div>

                                <div className="detail-description">
                                    <h3>About this Resource</h3>
                                    <p>{resource.description}</p>
                                </div>

                                {/* Preview Area */}
                                <div className="detail-preview glass">
                                    <div className="preview-placeholder">
                                        <Eye size={40} />
                                        <h3>Preview</h3>
                                        <p>File preview would appear here for PDFs and images</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="detail-sidebar">
                            {/* Actions Card */}
                            <div className="actions-card glass">
                                <div className="detail-stats-row">
                                    <div className="detail-stat">
                                        <Heart size={18} />
                                        <span>{resource.likes}</span>
                                        <small>Likes</small>
                                    </div>
                                    <div className="detail-stat">
                                        <Download size={18} />
                                        <span>{resource.downloads}</span>
                                        <small>Downloads</small>
                                    </div>
                                </div>

                                <button className="btn btn-primary action-btn" onClick={handleDownload}>
                                    <Download size={18} /> Download Resource
                                </button>
                                <button className={`btn btn-secondary action-btn ${bookmarked ? 'bookmarked' : ''}`} onClick={handleBookmark}>
                                    <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                                    {bookmarked ? 'Bookmarked' : 'Bookmark'}
                                </button>
                                <div className="action-row">
                                    <button className="btn btn-ghost action-small" onClick={handleLike}>
                                        <Heart size={16} /> Like
                                    </button>
                                    <button className="btn btn-ghost action-small" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                                        <Share2 size={16} /> Share
                                    </button>
                                </div>
                            </div>

                            {/* Related Resources */}
                            {relatedResources.length > 0 && (
                                <div className="related-section">
                                    <h3 className="related-heading">Related Resources</h3>
                                    <div className="related-list">
                                        {relatedResources.map(r => (
                                            <Link key={r.id} to={`/resource/${r.id}`} className="related-item glass">
                                                <h4>{r.title}</h4>
                                                <div className="related-meta">
                                                    <span className="tag tag-primary" style={{ fontSize: '10px' }}>{r.type}</span>
                                                    <span className="related-likes"><Heart size={12} /> {r.likes}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
