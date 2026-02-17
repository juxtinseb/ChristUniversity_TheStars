import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SEED_RESOURCES } from '../data/mockData';

const ResourceContext = createContext(null);

const STORAGE_KEY = 'campusshare_resources';
const BOOKMARKS_KEY = 'campusshare_bookmarks';

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

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    }, [resources]);

    useEffect(() => {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }, [bookmarks]);

    const addResource = useCallback((resource) => {
        const newResource = {
            ...resource,
            id: 'res_' + Date.now(),
            likes: 0,
            downloads: 0,
            bookmarks: 0,
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

    const searchResources = useCallback((query, filters = {}) => {
        let result = [...resources];

        if (query) {
            const q = query.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.subject.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.author.toLowerCase().includes(q)
            );
        }

        if (filters.type) {
            result = result.filter(r => r.type === filters.type);
        }
        if (filters.subject) {
            result = result.filter(r => r.subject === filters.subject);
        }
        if (filters.semester) {
            result = result.filter(r => r.semester === filters.semester);
        }
        if (filters.year) {
            result = result.filter(r => r.year === filters.year);
        }

        if (filters.sort === 'popular') {
            result.sort((a, b) => b.likes - a.likes);
        } else if (filters.sort === 'downloads') {
            result.sort((a, b) => b.downloads - a.downloads);
        } else {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [resources]);

    const deleteResource = useCallback((id) => {
        setResources(prev => prev.filter(r => r.id !== id));
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
