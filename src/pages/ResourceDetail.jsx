import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Heart, Download, Bookmark, Calendar, User,
    BookOpen, FileText, FolderKanban, Library, ClipboardList,
    GraduationCap, Share2, Eye, Lock, Globe, Shield, Building2,
    Star, MessageSquare, Edit3, Trash2
} from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { RESOURCE_TYPES } from '../data/mockData';
import ResourceCard from '../components/ResourceCard';
import './ResourceDetail.css';

const iconMap = {
    BookOpen, FileText, FolderKanban, Library, ClipboardList, GraduationCap,
};

function StarRating({ rating, onRate, size = 20, interactive = false }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating-input">
            {Array.from({ length: 5 }, (_, i) => {
                const value = i + 1;
                return (
                    <button
                        key={i}
                        type="button"
                        className={`star-btn ${value <= (hover || rating) ? 'active' : ''}`}
                        onClick={() => interactive && onRate?.(value)}
                        onMouseEnter={() => interactive && setHover(value)}
                        onMouseLeave={() => interactive && setHover(0)}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                    >
                        <Star
                            size={size}
                            fill={value <= (hover || rating) ? 'currentColor' : 'none'}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        getResourceById, likeResource, downloadResource, toggleBookmark, isBookmarked,
        searchResources, getReviewsForResource, getUserReview, getAverageRating, addReview, deleteReview
    } = useResources();
    const { isAuthenticated, user, setShowAuthModal, canAccessResource } = useAuth();

    const resource = getResourceById(id);

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(false);

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
    const isPrivate = resource.privacy === 'private';
    const hasAccess = canAccessResource(resource);
    const { average: avgRating, count: reviewCount } = getAverageRating(resource.id);
    const allReviews = getReviewsForResource(resource.id);
    const userReview = user ? getUserReview(resource.id, user.id) : null;

    const relatedResources = searchResources('', { subject: resource.subject })
        .filter(r => r.id !== resource.id)
        .slice(0, 3);

    const handleLike = () => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        likeResource(resource.id);
    };

    const handleDownload = () => {
        if (isPrivate && !hasAccess) return;
        downloadResource(resource.id);
    };

    const handleBookmark = () => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        toggleBookmark(resource.id);
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        if (reviewRating === 0) return;
        addReview(resource.id, user.id, user.name, user.college || '', reviewRating, reviewComment);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewForm(false);
        setEditingReview(false);
    };

    const handleEditReview = () => {
        if (userReview) {
            setReviewRating(userReview.rating);
            setReviewComment(userReview.comment);
            setEditingReview(true);
            setShowReviewForm(true);
        }
    };

    const handleDeleteReview = (reviewId) => {
        if (window.confirm('Delete this review?')) {
            deleteReview(reviewId);
        }
    };

    const handleWriteReview = () => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        if (userReview) {
            handleEditReview();
        } else {
            setShowReviewForm(true);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // Access denied gate
    if (isPrivate && !hasAccess) {
        return (
            <div className="detail-page">
                <div className="container">
                    <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <motion.div
                        className="access-denied glass"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="access-denied-icon">
                            <Shield size={48} />
                        </div>
                        <h2>Access Restricted</h2>
                        <p className="access-denied-title">{resource.title}</p>
                        <div className="access-denied-info">
                            <Lock size={16} />
                            <span>This resource is <strong>Private</strong> and only accessible to students from <strong>{resource.authorCollege}</strong></span>
                        </div>
                        {!isAuthenticated ? (
                            <div className="access-denied-action">
                                <p>Log in with your {resource.authorCollege} account to access this resource.</p>
                                <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                                    Log In / Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="access-denied-action">
                                <p>Your college: <strong>{user.college}</strong></p>
                                <p className="access-denied-note">You need to be registered with {resource.authorCollege} to access this resource.</p>
                            </div>
                        )}
                        <Link to="/browse" className="btn btn-secondary" style={{ marginTop: '8px' }}>
                            Browse Public Resources
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

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
                                    <div className={`detail-privacy-badge ${isPrivate ? 'private' : 'public'}`}>
                                        {isPrivate ? <Lock size={13} /> : <Globe size={13} />}
                                        {isPrivate ? 'Private' : 'Public'}
                                    </div>
                                    {resource.semester && <span className="tag tag-blue">{resource.semester} Sem</span>}
                                    {resource.year && <span className="tag tag-green">{resource.year}</span>}
                                </div>

                                <h1 className="detail-title">{resource.title}</h1>

                                {/* Rating Summary */}
                                <div className="detail-rating-summary">
                                    <StarRating rating={Math.round(avgRating || resource.rating)} size={18} />
                                    <span className="rating-avg">{avgRating || resource.rating || '—'}</span>
                                    <span className="rating-count">
                                        ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                                    </span>
                                </div>

                                <div className="detail-meta">
                                    <div className="detail-author">
                                        <div className="detail-avatar" style={{ background: typeInfo.color }}>
                                            {resource.author.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="detail-author-name">{resource.author}</span>
                                            {resource.authorCollege && (
                                                <span className="detail-college">
                                                    <Building2 size={12} /> {resource.authorCollege}
                                                </span>
                                            )}
                                            <span className="detail-date">
                                                <Calendar size={12} /> {formatDate(resource.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="detail-subject tag tag-primary">{resource.subject}</div>
                                </div>

                                {/* Tags */}
                                {resource.tags && resource.tags.length > 0 && (
                                    <div className="detail-tags">
                                        {resource.tags.map(tag => (
                                            <Link key={tag} to={`/browse?q=${encodeURIComponent(tag)}`} className="detail-tag">
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {resource.branch && (
                                    <div className="detail-branch">
                                        <GraduationCap size={14} />
                                        <span>{resource.branch}</span>
                                    </div>
                                )}

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

                            {/* ─── Reviews Section ─── */}
                            <div className="reviews-section">
                                <div className="reviews-header">
                                    <div className="reviews-header-left">
                                        <h2>
                                            <MessageSquare size={22} />
                                            Reviews & Ratings
                                        </h2>
                                        {reviewCount > 0 && (
                                            <div className="reviews-summary-inline">
                                                <StarRating rating={Math.round(avgRating)} size={16} />
                                                <span className="reviews-avg-inline">{avgRating}</span>
                                                <span className="reviews-count-inline">· {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                    {!showReviewForm && (
                                        <button className="btn btn-primary btn-sm" onClick={handleWriteReview}>
                                            {userReview ? <><Edit3 size={14} /> Edit Review</> : <><Star size={14} /> Write Review</>}
                                        </button>
                                    )}
                                </div>

                                {/* Review Form */}
                                {showReviewForm && (
                                    <motion.form
                                        className="review-form glass"
                                        onSubmit={handleSubmitReview}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h3>{editingReview ? 'Edit Your Review' : 'Write a Review'}</h3>

                                        <div className="review-rating-row">
                                            <label>Your Rating *</label>
                                            <StarRating rating={reviewRating} onRate={setReviewRating} size={28} interactive />
                                            {reviewRating > 0 && (
                                                <span className="review-rating-label">
                                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                                                </span>
                                            )}
                                        </div>

                                        <div className="input-group">
                                            <label htmlFor="review-comment">Your Review</label>
                                            <textarea
                                                id="review-comment"
                                                className="input-field textarea"
                                                placeholder="Share your experience with this resource..."
                                                rows={4}
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                            />
                                        </div>

                                        <div className="review-form-actions">
                                            <button type="submit" className="btn btn-primary" disabled={reviewRating === 0}>
                                                {editingReview ? 'Update Review' : 'Submit Review'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={() => { setShowReviewForm(false); setEditingReview(false); setReviewRating(0); setReviewComment(''); }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.form>
                                )}

                                {/* Review List */}
                                {allReviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {allReviews.map((review, i) => (
                                            <motion.div
                                                key={review.id}
                                                className="review-item glass"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <div className="review-item-header">
                                                    <div className="review-author">
                                                        <div className="review-avatar">
                                                            {review.userName.charAt(0)}
                                                        </div>
                                                        <div className="review-author-info">
                                                            <span className="review-author-name">
                                                                {review.userName}
                                                                {user && review.userId === user.id && (
                                                                    <span className="review-you-badge">You</span>
                                                                )}
                                                            </span>
                                                            {review.userCollege && (
                                                                <span className="review-college">{review.userCollege}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="review-header-right">
                                                        <StarRating rating={review.rating} size={14} />
                                                        <span className="review-date">{formatDate(review.createdAt)}</span>
                                                        {review.updatedAt && (
                                                            <span className="review-edited">(edited)</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {review.comment && (
                                                    <p className="review-comment">{review.comment}</p>
                                                )}

                                                {/* Actions for own review */}
                                                {user && review.userId === user.id && (
                                                    <div className="review-actions">
                                                        <button className="btn btn-ghost btn-xs" onClick={handleEditReview}>
                                                            <Edit3 size={12} /> Edit
                                                        </button>
                                                        <button className="btn btn-ghost btn-xs review-delete" onClick={() => handleDeleteReview(review.id)}>
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="reviews-empty glass">
                                        <MessageSquare size={32} />
                                        <p>No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="detail-sidebar">
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
                                    <div className="detail-stat">
                                        <Star size={18} className="star-filled" />
                                        <span>{avgRating || '—'}</span>
                                        <small>{reviewCount} Reviews</small>
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

                            {relatedResources.length > 0 && (
                                <div className="related-section">
                                    <h3 className="related-heading">Related Resources</h3>
                                    <div className="related-list">
                                        {relatedResources.map(r => (
                                            <Link key={r.id} to={`/resource/${r.id}`} className="related-item glass">
                                                <div className="related-item-header">
                                                    <h4>{r.title}</h4>
                                                    <div className={`related-privacy ${r.privacy}`}>
                                                        {r.privacy === 'private' ? <Lock size={10} /> : <Globe size={10} />}
                                                    </div>
                                                </div>
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
