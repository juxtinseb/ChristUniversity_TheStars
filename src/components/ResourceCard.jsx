import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart, Download, BookOpen, FileText, FolderKanban, Library,
    ClipboardList, GraduationCap, Bookmark, Lock, Globe, Star
} from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { RESOURCE_TYPES } from '../data/mockData';
import './ResourceCard.css';

const iconMap = {
    BookOpen, FileText, FolderKanban, Library, ClipboardList, GraduationCap,
};

export default function ResourceCard({ resource, index = 0 }) {
    const { likeResource, toggleBookmark, isBookmarked, getAverageRating } = useResources();
    const { isAuthenticated, setShowAuthModal, canAccessResource } = useAuth();

    const typeInfo = RESOURCE_TYPES.find(t => t.id === resource.type) || RESOURCE_TYPES[0];
    const TypeIcon = iconMap[typeInfo.icon] || BookOpen;
    const bookmarked = isBookmarked(resource.id);
    const isPrivate = resource.privacy === 'private';
    const hasAccess = canAccessResource(resource);
    const { average: avgRating, count: reviewCount } = getAverageRating(resource.id);

    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        likeResource(resource.id);
    };

    const handleBookmark = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        toggleBookmark(resource.id);
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days < 1) return 'Today';
        if (days < 30) return `${days}d ago`;
        if (days < 365) return `${Math.floor(days / 30)}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={12}
                className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}
                fill={i < Math.round(rating) ? 'currentColor' : 'none'}
            />
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <Link to={`/resource/${resource.id}`} className={`resource-card glass ${isPrivate && !hasAccess ? 'restricted' : ''}`}>
                <div className="card-header">
                    <div className="card-badges-left">
                        <div className="card-type-badge" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>
                            <TypeIcon size={14} />
                            {typeInfo.label}
                        </div>
                        <div className={`privacy-badge ${isPrivate ? 'private' : 'public'}`}>
                            {isPrivate ? <Lock size={11} /> : <Globe size={11} />}
                            {isPrivate ? 'Private' : 'Public'}
                        </div>
                    </div>
                    <button
                        className={`bookmark-btn ${bookmarked ? 'active' : ''}`}
                        onClick={handleBookmark}
                        title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                        <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>

                <h3 className="card-title">{resource.title}</h3>
                <p className="card-desc">{resource.description}</p>

                {/* Rating Summary */}
                {(avgRating > 0 || resource.rating > 0) && (
                    <div className="card-rating">
                        <div className="card-stars">
                            {renderStars(avgRating || resource.rating)}
                        </div>
                        <span className="card-rating-value">{avgRating || resource.rating}</span>
                        {reviewCount > 0 && (
                            <span className="card-review-count">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                        )}
                    </div>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                    <div className="card-tags">
                        {resource.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="card-tag">{tag}</span>
                        ))}
                        {resource.tags.length > 3 && (
                            <span className="card-tag more-tag">+{resource.tags.length - 3}</span>
                        )}
                    </div>
                )}

                <div className="card-meta">
                    <span className="card-subject tag tag-primary">{resource.subject}</span>
                    <span className="card-time">{timeAgo(resource.createdAt)}</span>
                </div>

                {/* Private access indicator */}
                {isPrivate && (
                    <div className={`access-indicator ${hasAccess ? 'has-access' : 'no-access'}`}>
                        {hasAccess ? (
                            <><Lock size={12} /> College access granted</>
                        ) : (
                            <><Lock size={12} /> {resource.authorCollege} only</>
                        )}
                    </div>
                )}

                <div className="card-footer">
                    <div className="card-author">
                        <div className="author-avatar" style={{ background: typeInfo.color }}>
                            {resource.author.charAt(0)}
                        </div>
                        <div className="author-info-col">
                            <span className="author-name">{resource.author}</span>
                            {resource.authorCollege && (
                                <span className="author-college">{resource.authorCollege}</span>
                            )}
                        </div>
                    </div>

                    <div className="card-stats">
                        <button className="stat-btn" onClick={handleLike}>
                            <Heart size={14} fill={resource.likes > 0 ? 'currentColor' : 'none'} />
                            <span>{resource.likes}</span>
                        </button>
                        <div className="stat-item">
                            <Download size={14} />
                            <span>{resource.downloads}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
