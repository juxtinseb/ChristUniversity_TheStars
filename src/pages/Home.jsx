import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, BookOpen, FileText, FolderKanban, Library,
    ClipboardList, GraduationCap, TrendingUp, Users, Download,
    ArrowRight, Sparkles
} from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import ResourceCard from '../components/ResourceCard';
import { RESOURCE_TYPES } from '../data/mockData';
import './Home.css';

const iconMap = {
    BookOpen, FileText, FolderKanban, Library, ClipboardList, GraduationCap,
};

function AnimatedCounter({ end, duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const start = Date.now();
                    const tick = () => {
                        const elapsed = Date.now() - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { searchResources, stats } = useResources();

    const trendingResources = searchResources('', { sort: 'popular' }).slice(0, 6);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="hero-orb hero-orb-3"></div>
                </div>
                <div className="container hero-content">
                    <motion.div
                        className="hero-badge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Sparkles size={14} />
                        Your Campus Knowledge Hub
                    </motion.div>
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Share & Discover<br />
                        <span className="gradient-text">Academic Resources</span>
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Access past papers, class notes, study materials, and more — shared by students, for students.
                    </motion.p>

                    <motion.form
                        className="hero-search"
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Search size={22} className="hero-search-icon" />
                        <input
                            type="text"
                            placeholder="Search notes, papers, projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="hero-search-input"
                        />
                        <button type="submit" className="btn btn-primary hero-search-btn">
                            Search
                        </button>
                    </motion.form>

                    <motion.div
                        className="hero-quick-links"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <span className="quick-label">Popular:</span>
                        {['Data Structures', 'Previous Year Papers', 'Machine Learning'].map((term) => (
                            <button
                                key={term}
                                className="quick-link"
                                onClick={() => navigate(`/browse?q=${encodeURIComponent(term)}`)}
                            >
                                {term}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Browse by Category</h2>
                            <p className="section-subtitle">Find exactly what you need</p>
                        </div>
                        <Link to="/browse" className="btn btn-secondary">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="categories-grid">
                        {RESOURCE_TYPES.map((type, i) => {
                            const Icon = iconMap[type.icon] || BookOpen;
                            return (
                                <motion.div
                                    key={type.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.08 }}
                                >
                                    <Link
                                        to={`/browse?type=${type.id}`}
                                        className="category-card glass"
                                    >
                                        <div className="category-icon" style={{ background: `${type.color}20`, color: type.color }}>
                                            <Icon size={28} />
                                        </div>
                                        <h3 className="category-name">{type.label}</h3>
                                        <ArrowRight size={16} className="category-arrow" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section className="trending-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">
                                <TrendingUp size={28} className="section-icon" />
                                Trending Resources
                            </h2>
                            <p className="section-subtitle">Most liked by the community</p>
                        </div>
                        <Link to="/browse?sort=popular" className="btn btn-secondary">
                            See More <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="resources-grid">
                        {trendingResources.map((resource, i) => (
                            <ResourceCard key={resource.id} resource={resource} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card glass">
                            <div className="stat-icon-wrap" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                                <FileText size={28} color="#7c3aed" />
                            </div>
                            <div className="stat-number">
                                <AnimatedCounter end={stats.totalResources} />+
                            </div>
                            <div className="stat-label">Resources Shared</div>
                        </div>
                        <div className="stat-card glass">
                            <div className="stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                                <Users size={28} color="#3b82f6" />
                            </div>
                            <div className="stat-number">
                                <AnimatedCounter end={850} />+
                            </div>
                            <div className="stat-label">Active Students</div>
                        </div>
                        <div className="stat-card glass">
                            <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                <Download size={28} color="#10b981" />
                            </div>
                            <div className="stat-number">
                                <AnimatedCounter end={stats.totalDownloads} />+
                            </div>
                            <div className="stat-label">Total Downloads</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
