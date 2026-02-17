import { createContext, useContext, useState, useCallback } from 'react';
import { SEED_RESOURCES } from '../data/mockData';

const ResourceContext = createContext(null);

const RESOURCES_KEY = 'campusshare_resources';
const REVIEWS_KEY = 'campusshare_reviews';
const BOOKMARKS_KEY = 'campusshare_bookmarks';

export function ResourceProvider({ children }) {
    const [resources, setResources] = useState(() => {
        try {
            const saved = localStorage.getItem(RESOURCES_KEY);
            if (saved) return JSON.parse(saved);
            localStorage.setItem(RESOURCES_KEY, JSON.stringify(SEED_RESOURCES));
            return SEED_RESOURCES;
        } catch {
            return SEED_RESOURCES;
        }
    });

    const [reviews, setReviews] = useState(() => {
        try {
            const saved = localStorage.getItem(REVIEWS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [bookmarks, setBookmarks] = useState(() => {
        try {
            const saved = localStorage.getItem(BOOKMARKS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const persist = (newResources) => {
        setResources(newResources);
        localStorage.setItem(RESOURCES_KEY, JSON.stringify(newResources));
    };

    const persistReviews = (newReviews) => {
        setReviews(newReviews);
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(newReviews));
    };

    const persistBookmarks = (newBookmarks) => {
        setBookmarks(newBookmarks);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    };

    // ─── Search & Filter ─────────────────────────────────

    const searchResources = useCallback((query, filters = {}) => {
        let result = [...resources];

        // Text search
        if (query) {
            const q = query.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.subject.toLowerCase().includes(q) ||
                (r.description || '').toLowerCase().includes(q) ||
                (r.author || '').toLowerCase().includes(q) ||
                (r.authorName || '').toLowerCase().includes(q) ||
                (r.tags || []).some(t => t.toLowerCase().includes(q)) ||
                (r.branch || '').toLowerCase().includes(q)
            );
        }

        // Filters
        if (filters.type) result = result.filter(r => r.type === filters.type);
        if (filters.subject) result = result.filter(r => r.subject === filters.subject);
        if (filters.semester) result = result.filter(r => r.semester === filters.semester);
        if (filters.year) result = result.filter(r => r.year === filters.year);
        if (filters.branch) result = result.filter(r => r.branch === filters.branch);
        if (filters.privacy) result = result.filter(r => r.privacy === filters.privacy);

        // Sort
        const sort = filters.sort || 'latest';
        if (sort === 'latest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sort === 'popular') result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        else if (sort === 'downloads') result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        else if (sort === 'rating') {
            result.sort((a, b) => {
                const avgA = getAverageRating(a.id);
                const avgB = getAverageRating(b.id);
                return avgB - avgA;
            });
        }

        return result;
    }, [resources, reviews]);

    // ─── CRUD ─────────────────────────────────────────────

    const getResourceById = useCallback((id) => {
        return resources.find(r => r.id === id);
    }, [resources]);

    const addResource = useCallback((resourceData) => {
        const newResource = {
            ...resourceData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            likes: 0,
            downloads: 0,
            rating: 0,
        };
        persist([newResource, ...resources]);
        return newResource;
    }, [resources]);

    const updateResource = useCallback((id, updates) => {
        const updated = resources.map(r => r.id === id ? { ...r, ...updates } : r);
        persist(updated);
    }, [resources]);

    const deleteResource = useCallback((id) => {
        persist(resources.filter(r => r.id !== id));
        persistReviews(reviews.filter(r => r.resourceId !== id));
    }, [resources, reviews]);

    const likeResource = useCallback((id) => {
        const updated = resources.map(r =>
            r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r
        );
        persist(updated);
    }, [resources]);

    const downloadResource = useCallback((id) => {
        const updated = resources.map(r =>
            r.id === id ? { ...r, downloads: (r.downloads || 0) + 1 } : r
        );
        persist(updated);
    }, [resources]);

    // ─── Bookmarks ────────────────────────────────────────

    const toggleBookmark = useCallback((id) => {
        const newBookmarks = bookmarks.includes(id)
            ? bookmarks.filter(b => b !== id)
            : [...bookmarks, id];
        persistBookmarks(newBookmarks);
    }, [bookmarks]);

    const isBookmarked = useCallback((id) => {
        return bookmarks.includes(id);
    }, [bookmarks]);

    // ─── Reviews ──────────────────────────────────────────

    const getReviewsForResource = useCallback((resourceId) => {
        return reviews.filter(r => r.resourceId === resourceId);
    }, [reviews]);

    const getUserReview = useCallback((resourceId, userId) => {
        return reviews.find(r => r.resourceId === resourceId && r.userId === userId);
    }, [reviews]);

    const getAverageRating = useCallback((resourceId) => {
        const resourceReviews = reviews.filter(r => r.resourceId === resourceId);
        if (resourceReviews.length === 0) return 0;
        const sum = resourceReviews.reduce((acc, r) => acc + r.rating, 0);
        return Math.round((sum / resourceReviews.length) * 10) / 10;
    }, [reviews]);

    const addReview = useCallback((reviewData) => {
        const existing = reviews.findIndex(
            r => r.resourceId === reviewData.resourceId && r.userId === reviewData.userId
        );
        let newReviews;
        if (existing >= 0) {
            // Update existing review
            newReviews = reviews.map((r, i) => i === existing
                ? { ...r, ...reviewData, updatedAt: new Date().toISOString() }
                : r
            );
        } else {
            // New review
            newReviews = [...reviews, {
                ...reviewData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            }];
        }
        persistReviews(newReviews);
    }, [reviews]);

    const deleteReview = useCallback((reviewId) => {
        persistReviews(reviews.filter(r => r.id !== reviewId));
    }, [reviews]);

    return (
        <ResourceContext.Provider value={{
            resources,
            searchResources,
            getResourceById,
            addResource,
            updateResource,
            deleteResource,
            likeResource,
            downloadResource,
            toggleBookmark,
            isBookmarked,
            bookmarks,
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
