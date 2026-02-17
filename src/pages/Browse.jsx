import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import ResourceCard from '../components/ResourceCard';
import { SUBJECTS, RESOURCE_TYPES, SEMESTERS, YEARS } from '../data/mockData';
import './Browse.css';

export default function Browse() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { searchResources } = useResources();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        subject: searchParams.get('subject') || '',
        semester: searchParams.get('semester') || '',
        year: searchParams.get('year') || '',
        sort: searchParams.get('sort') || 'recent',
    });
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    const results = searchResources(query, filters);

    useEffect(() => {
        setQuery(searchParams.get('q') || '');
        setFilters(prev => ({
            ...prev,
            type: searchParams.get('type') || prev.type,
            sort: searchParams.get('sort') || prev.sort,
        }));
    }, [searchParams]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: '', subject: '', semester: '', year: '', sort: 'recent' });
        setQuery('');
        setSearchParams({});
    };

    const activeFilterCount = [filters.type, filters.subject, filters.semester, filters.year].filter(Boolean).length;

    return (
        <div className="browse-page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="browse-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="section-title">Browse Resources</h1>
                    <p className="section-subtitle">
                        {results.length} resource{results.length !== 1 ? 's' : ''} found
                    </p>
                </motion.div>

                {/* Search & Controls */}
                <div className="browse-controls">
                    <form className="browse-search" onSubmit={(e) => e.preventDefault()}>
                        <Search size={18} className="browse-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title, subject, author..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="input-field browse-search-input"
                        />
                    </form>

                    <div className="controls-right">
                        <select
                            className="input-field sort-select"
                            value={filters.sort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                        >
                            <option value="recent">Most Recent</option>
                            <option value="popular">Most Popular</option>
                            <option value="downloads">Most Downloaded</option>
                        </select>

                        <div className="view-toggle">
                            <button
                                className={`btn btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 size={18} />
                            </button>
                            <button
                                className={`btn btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            className="btn btn-secondary filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                        </button>
                    </div>
                </div>

                <div className="browse-layout">
                    {/* Sidebar Filters */}
                    <aside className={`filter-sidebar glass ${showFilters ? 'open' : ''}`}>
                        <div className="filter-header">
                            <h3>Filters</h3>
                            {activeFilterCount > 0 && (
                                <button className="btn btn-ghost" onClick={clearFilters}>
                                    <X size={14} /> Clear All
                                </button>
                            )}
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Resource Type</label>
                            <div className="filter-options">
                                {RESOURCE_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        className={`filter-chip ${filters.type === type.id ? 'active' : ''}`}
                                        onClick={() => updateFilter('type', filters.type === type.id ? '' : type.id)}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Subject</label>
                            <select
                                className="input-field"
                                value={filters.subject}
                                onChange={(e) => updateFilter('subject', e.target.value)}
                            >
                                <option value="">All Subjects</option>
                                {SUBJECTS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Semester</label>
                            <select
                                className="input-field"
                                value={filters.semester}
                                onChange={(e) => updateFilter('semester', e.target.value)}
                            >
                                <option value="">All Semesters</option>
                                {SEMESTERS.map(s => (
                                    <option key={s} value={s}>{s} Semester</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Year</label>
                            <select
                                className="input-field"
                                value={filters.year}
                                onChange={(e) => updateFilter('year', e.target.value)}
                            >
                                <option value="">All Years</option>
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="browse-results">
                        {results.length > 0 ? (
                            <div className={`results-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                                {results.map((resource, i) => (
                                    <ResourceCard key={resource.id} resource={resource} index={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state glass">
                                <Search size={48} className="empty-icon" />
                                <h3>No resources found</h3>
                                <p>Try adjusting your search or filters</p>
                                <button className="btn btn-primary" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
