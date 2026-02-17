import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, X, Filter } from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import ResourceCard from '../components/ResourceCard';
import { SUBJECTS, RESOURCE_TYPES, SEMESTERS, YEARS, BRANCHES } from '../data/mockData';
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
        branch: searchParams.get('branch') || '',
        privacy: searchParams.get('privacy') || '',
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
            branch: searchParams.get('branch') || prev.branch,
            privacy: searchParams.get('privacy') || prev.privacy,
        }));
    }, [searchParams]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: '', subject: '', semester: '', year: '', branch: '', privacy: '', sort: 'recent' });
        setQuery('');
        setSearchParams({});
    };

    const activeFilterCount = [filters.type, filters.subject, filters.semester, filters.year, filters.branch, filters.privacy].filter(Boolean).length;

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
                        {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
                    </p>
                </motion.div>

                {/* Search & Controls */}
                <div className="browse-controls">
                    <form className="browse-search" onSubmit={(e) => e.preventDefault()}>
                        <Search size={18} className="browse-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title, subject, tags, keywords..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="input-field browse-search-input"
                        />
                        {query && (
                            <button
                                type="button"
                                className="search-clear"
                                onClick={() => setQuery('')}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>

                    <div className="controls-right">
                        <select
                            className="input-field sort-select"
                            value={filters.sort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                        >
                            <option value="recent">📅 Latest Uploads</option>
                            <option value="popular">❤️ Most Popular</option>
                            <option value="rating">⭐ Highest Rated</option>
                            <option value="downloads">📥 Most Downloaded</option>
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

                {/* Active filter chips */}
                {activeFilterCount > 0 && (
                    <div className="active-filters">
                        <Filter size={14} />
                        {filters.type && (
                            <span className="active-chip">
                                {RESOURCE_TYPES.find(t => t.id === filters.type)?.label || filters.type}
                                <button onClick={() => updateFilter('type', '')}><X size={12} /></button>
                            </span>
                        )}
                        {filters.subject && (
                            <span className="active-chip">
                                {filters.subject}
                                <button onClick={() => updateFilter('subject', '')}><X size={12} /></button>
                            </span>
                        )}
                        {filters.semester && (
                            <span className="active-chip">
                                {filters.semester} Sem
                                <button onClick={() => updateFilter('semester', '')}><X size={12} /></button>
                            </span>
                        )}
                        {filters.year && (
                            <span className="active-chip">
                                {filters.year}
                                <button onClick={() => updateFilter('year', '')}><X size={12} /></button>
                            </span>
                        )}
                        {filters.branch && (
                            <span className="active-chip">
                                {filters.branch}
                                <button onClick={() => updateFilter('branch', '')}><X size={12} /></button>
                            </span>
                        )}
                        {filters.privacy && (
                            <span className="active-chip">
                                {filters.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
                                <button onClick={() => updateFilter('privacy', '')}><X size={12} /></button>
                            </span>
                        )}
                        <button className="clear-all-btn" onClick={clearFilters}>
                            Clear All
                        </button>
                    </div>
                )}

                <div className="browse-layout">
                    {/* Sidebar Filters */}
                    <aside className={`filter-sidebar glass ${showFilters ? 'open' : ''}`}>
                        <div className="filter-header">
                            <h3>Filters</h3>
                            {activeFilterCount > 0 && (
                                <button className="btn btn-ghost" onClick={clearFilters}>
                                    <X size={14} /> Clear
                                </button>
                            )}
                            <button
                                className="btn btn-ghost btn-icon mobile-filter-close"
                                onClick={() => setShowFilters(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Resource Type */}
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

                        {/* Subject / Course */}
                        <div className="filter-group">
                            <label className="filter-label">Subject / Course</label>
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

                        {/* Branch / Department */}
                        <div className="filter-group">
                            <label className="filter-label">Branch / Department</label>
                            <select
                                className="input-field"
                                value={filters.branch}
                                onChange={(e) => updateFilter('branch', e.target.value)}
                            >
                                <option value="">All Branches</option>
                                {BRANCHES.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        {/* Semester */}
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

                        {/* Year / Batch */}
                        <div className="filter-group">
                            <label className="filter-label">Year / Batch</label>
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

                        {/* Privacy Level */}
                        <div className="filter-group">
                            <label className="filter-label">Privacy Level</label>
                            <div className="filter-options">
                                <button
                                    className={`filter-chip ${filters.privacy === 'public' ? 'active' : ''}`}
                                    onClick={() => updateFilter('privacy', filters.privacy === 'public' ? '' : 'public')}
                                >
                                    🌐 Public
                                </button>
                                <button
                                    className={`filter-chip ${filters.privacy === 'private' ? 'active' : ''}`}
                                    onClick={() => updateFilter('privacy', filters.privacy === 'private' ? '' : 'private')}
                                >
                                    🔒 Private
                                </button>
                            </div>
                        </div>

                        {/* Mobile apply */}
                        <button
                            className="btn btn-primary mobile-apply-btn"
                            onClick={() => setShowFilters(false)}
                        >
                            Apply Filters ({results.length} results)
                        </button>
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
