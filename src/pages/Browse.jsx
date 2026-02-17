import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, SlidersHorizontal, X, ChevronDown, ArrowUpDown
} from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import { useResources } from '../context/ResourceContext';
import { RESOURCE_TYPES, SUBJECTS, BRANCHES } from '../data/mockData';
import './Browse.css';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const YEARS = ['2024', '2023', '2022', '2021', '2020'];
const SORT_OPTIONS = [
    { id: 'latest', label: 'Latest Uploads' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'downloads', label: 'Most Downloaded' },
];

export default function Browse() {
    const { searchResources } = useResources();
    const [searchParams, setSearchParams] = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        subject: searchParams.get('subject') || '',
        semester: searchParams.get('semester') || '',
        year: searchParams.get('year') || '',
        branch: searchParams.get('branch') || '',
        privacy: searchParams.get('privacy') || '',
        sort: searchParams.get('sort') || 'latest',
    });
    const [showFilters, setShowFilters] = useState(false);

    const results = searchResources(query, filters);

    const handleSearch = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams();
        if (query) newParams.set('q', query);
        Object.entries(filters).forEach(([key, val]) => {
            if (val && val !== 'latest') newParams.set(key, val);
        });
        setSearchParams(newParams);
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: '' }));
    };

    const clearAll = () => {
        setQuery('');
        setFilters({ type: '', subject: '', semester: '', year: '', branch: '', privacy: '', sort: 'latest' });
        setSearchParams({});
    };

    const activeFilterCount = Object.entries(filters).filter(
        ([key, val]) => val && key !== 'sort'
    ).length + (query ? 1 : 0);

    const activeFilters = [];
    if (query) activeFilters.push({ key: 'q', label: `"${query}"`, onClear: () => setQuery('') });
    if (filters.type) {
        const t = RESOURCE_TYPES.find(r => r.id === filters.type);
        activeFilters.push({ key: 'type', label: t?.label || filters.type, onClear: () => clearFilter('type') });
    }
    if (filters.subject) activeFilters.push({ key: 'subject', label: filters.subject, onClear: () => clearFilter('subject') });
    if (filters.branch) activeFilters.push({ key: 'branch', label: filters.branch, onClear: () => clearFilter('branch') });
    if (filters.semester) activeFilters.push({ key: 'semester', label: `Sem ${filters.semester}`, onClear: () => clearFilter('semester') });
    if (filters.year) activeFilters.push({ key: 'year', label: filters.year, onClear: () => clearFilter('year') });
    if (filters.privacy) activeFilters.push({ key: 'privacy', label: filters.privacy === 'public' ? 'Public' : 'Private', onClear: () => clearFilter('privacy') });

    return (
        <div className="browse-page">
            <div className="container">
                <div className="browse-header">
                    <h1>Browse Resources</h1>
                    <p className="browse-subtitle">Discover academic resources shared by students</p>
                </div>

                <form className="browse-search" onSubmit={handleSearch}>
                    <div className="search-bar glass">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, subject, tags..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="input-field"
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Search</button>
                    </div>
                    <button
                        type="button"
                        className={`btn btn-secondary filter-toggle ${activeFilterCount > 0 ? 'has-filters' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal size={18} />
                        Filters {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                    </button>
                </form>

                {/* Sort + Active Filters */}
                <div className="browse-controls">
                    <div className="sort-select">
                        <ArrowUpDown size={14} />
                        <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
                            {SORT_OPTIONS.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="active-filters">
                            {activeFilters.map(f => (
                                <span key={f.key} className="filter-chip">
                                    {f.label}
                                    <button onClick={f.onClear}><X size={12} /></button>
                                </span>
                            ))}
                            <button className="clear-all-btn" onClick={clearAll}>Clear All</button>
                        </div>
                    )}
                </div>

                <div className={`browse-layout ${showFilters ? 'filters-open' : ''}`}>
                    {/* Filter Sidebar */}
                    {showFilters && (
                        <motion.aside
                            className="filter-sidebar glass"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="filter-sidebar-header">
                                <h3>Filters</h3>
                                <button className="btn btn-ghost btn-icon filter-close-mobile" onClick={() => setShowFilters(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label"><ChevronDown size={14} /> Resource Type</label>
                                <select className="input-field" value={filters.type} onChange={e => updateFilter('type', e.target.value)}>
                                    <option value="">All Types</option>
                                    {RESOURCE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label"><ChevronDown size={14} /> Subject</label>
                                <select className="input-field" value={filters.subject} onChange={e => updateFilter('subject', e.target.value)}>
                                    <option value="">All Subjects</option>
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label"><ChevronDown size={14} /> Branch</label>
                                <select className="input-field" value={filters.branch} onChange={e => updateFilter('branch', e.target.value)}>
                                    <option value="">All Branches</option>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label"><ChevronDown size={14} /> Semester</label>
                                <select className="input-field" value={filters.semester} onChange={e => updateFilter('semester', e.target.value)}>
                                    <option value="">All Semesters</option>
                                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label"><ChevronDown size={14} /> Year</label>
                                <select className="input-field" value={filters.year} onChange={e => updateFilter('year', e.target.value)}>
                                    <option value="">All Years</option>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label"><ChevronDown size={14} /> Privacy</label>
                                <select className="input-field" value={filters.privacy} onChange={e => updateFilter('privacy', e.target.value)}>
                                    <option value="">All</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>

                            <button className="btn btn-ghost filter-clear-btn" onClick={clearAll}>Clear Filters</button>
                        </motion.aside>
                    )}

                    {/* Resources Grid */}
                    <main className="browse-main">
                        {results.length > 0 ? (
                            <div className="resources-grid">
                                {results.map((r, i) => (
                                    <ResourceCard key={r.id} resource={r} index={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="browse-empty glass">
                                <Search size={40} />
                                <h3>No resources found</h3>
                                <p>Try adjusting your search or filters</p>
                                <button className="btn btn-secondary" onClick={clearAll}>Clear Filters</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
