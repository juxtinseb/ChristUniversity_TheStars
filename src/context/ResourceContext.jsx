import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SEED_RESOURCES } from '../data/mockData';

const ResourceContext = createContext(null);

const STORAGE_KEY = 'campusshare_resources';
const BOOKMARKS_KEY = 'campusshare_bookmarks';
const REVIEWS_KEY = 'campusshare_reviews';

export function ResourceProvider({ children }) {
    const [resources, setResources] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : SEED_RESOURCES;
        } catch {
            return SEED_RESOURCES;
        }
    });

    const [bookmarks, setBookmarks] = useState(() => {
        try {
            const saved = localStorage.getItem(BOOKMARKS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [reviews, setReviews] = useState(() => {
        try {
            const saved = localStorage.getItem(REVIEWS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    }, [resources]);

    useEffect(() => {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    }, [reviews]);

    const addResource = useCallback((resource) => {
        const newResource = {
            ...resource,
            id: 'res_' + Date.now(),
            likes: 0,
            downloads: 0,
            rating: 0,
            bookmarks: 0,
            tags: resource.tags || [],
            privacy: resource.privacy || 'public',
            branch: resource.branch || '',
            authorCollege: resource.authorCollege || '',
            createdAt: new Date().toISOString(),
        };
        setResources(prev => [newResource, ...prev]);
        return newResource;
    }, []);

    const likeResource = useCallback((id) => {
        setResources(prev =>
            prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r)
        );
    }, []);

    const downloadResource = useCallback((id) => {
        setResources(prev =>
            prev.map(r => r.id === id ? { ...r, downloads: r.downloads + 1 } : r)
        );
    }, []);

    const toggleBookmark = useCallback((id) => {
        setBookmarks(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        );
    }, []);

    const isBookmarked = useCallback((id) => {
        return bookmarks.includes(id);
    }, [bookmarks]);

    const getResourceById = useCallback((id) => {
        return resources.find(r => r.id === id) || null;
    }, [resources]);

    // ─── Reviews & Ratings ───────────────────────────────────────

    const getReviewsForResource = useCallback((resourceId) => {
        return reviews
            .filter(r => r.resourceId === resourceId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [reviews]);

    const getUserReview = useCallback((resourceId, userId) => {
        return reviews.find(r => r.resourceId === resourceId && r.userId === userId) || null;
    }, [reviews]);

    const getAverageRating = useCallback((resourceId) => {
        const resourceReviews = reviews.filter(r => r.resourceId === resourceId);
        if (resourceReviews.length === 0) return { average: 0, count: 0 };
        const sum = resourceReviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            average: Math.round((sum / resourceReviews.length) * 10) / 10,
            count: resourceReviews.length,
        };
    }, [reviews]);

    const addReview = useCallback((resourceId, userId, userName, userCollege, rating, comment) => {
        // Check if user already reviewed — if so, update instead
        const existing = reviews.find(r => r.resourceId === resourceId && r.userId === userId);
        if (existing) {
            setReviews(prev =>
                prev.map(r =>
                    r.id === existing.id
                        ? { ...r, rating, comment, updatedAt: new Date().toISOString() }
                        : r
                )
            );
        } else {
            const newReview = {
                id: 'rev_' + Date.now(),
                resourceId,
                userId,
                userName,
                userCollege,
                rating,
                comment,
                createdAt: new Date().toISOString(),
                updatedAt: null,
            };
            setReviews(prev => [newReview, ...prev]);
        }
    }, [reviews]);

    const deleteReview = useCallback((reviewId) => {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
    }, []);

    // ─── Search & Filter ─────────────────────────────────────────

    const searchResources = useCallback((query, filters = {}) => {
        let result = [...resources];

        if (query) {
            const q = query.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.subject.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.author.toLowerCase().includes(q) ||
                (r.tags && r.tags.some(tag => tag.toLowerCase().includes(q))) ||
                (r.branch && r.branch.toLowerCase().includes(q))
            );
        }

        if (filters.type) result = result.filter(r => r.type === filters.type);
        if (filters.subject) result = result.filter(r => r.subject === filters.subject);
        if (filters.semester) result = result.filter(r => r.semester === filters.semester);
        if (filters.year) result = result.filter(r => r.year === filters.year);
        if (filters.branch) result = result.filter(r => r.branch === filters.branch);
        if (filters.privacy) result = result.filter(r => r.privacy === filters.privacy);

        if (filters.sort === 'popular') {
            result.sort((a, b) => b.likes - a.likes);
        } else if (filters.sort === 'downloads') {
            result.sort((a, b) => b.downloads - a.downloads);
        } else if (filters.sort === 'rating') {
            result.sort((a, b) => {
                const ra = getAverageRating(a.id);
                const rb = getAverageRating(b.id);
                return rb.average - ra.average;
            });
        } else {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [resources, getAverageRating]);

    const deleteResource = useCallback((id) => {
        setResources(prev => prev.filter(r => r.id !== id));
        // Also delete related reviews
        setReviews(prev => prev.filter(r => r.resourceId !== id));
    }, []);

    const getBookmarkedResources = useCallback(() => {
        return resources.filter(r => bookmarks.includes(r.id));
    }, [resources, bookmarks]);

    const stats = {
        totalResources: resources.length,
        totalDownloads: resources.reduce((acc, r) => acc + r.downloads, 0),
        totalLikes: resources.reduce((acc, r) => acc + r.likes, 0),
    };

    return (
        <ResourceContext.Provider value={{
            resources,
            stats,
            addResource,
            likeResource,
            downloadResource,
            toggleBookmark,
            isBookmarked,
            getResourceById,
            searchResources,
            deleteResource,
            getBookmarkedResources,
            // Reviews
            getReviewsForResource,
            getUserReview,
            getAverageRating,
            addReview,
            deleteReview,
        }}>
            {children}
        </ResourceContext.Provider>
    );
}

export function useResources() {
    const context = useContext(ResourceContext);
    if (!context) throw new Error('useResources must be used within ResourceProvider');
    return context;
}
