import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Heart } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-inner">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <GraduationCap size={24} />
                        <span className="logo-text">
                            Campus<span className="gradient-text">Share</span>
                        </span>
                    </Link>
                    <p className="footer-desc">
                        Empowering students to share and discover academic resources across campus.
                    </p>
                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Platform</h4>
                    <Link to="/browse" className="footer-link">Browse Resources</Link>
                    <Link to="/upload" className="footer-link">Upload</Link>
                    <Link to="/browse?type=papers" className="footer-link">Past Papers</Link>
                    <Link to="/browse?type=notes" className="footer-link">Class Notes</Link>
                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Resources</h4>
                    <Link to="/browse?type=projects" className="footer-link">Projects</Link>
                    <Link to="/browse?type=books" className="footer-link">Reference Books</Link>
                    <Link to="/browse?type=assignments" className="footer-link">Assignments</Link>
                    <Link to="/browse?type=materials" className="footer-link">Study Materials</Link>
                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Connect</h4>
                    <a href="#" className="footer-link"><Github size={14} /> GitHub</a>
                    <a href="#" className="footer-link"><Twitter size={14} /> Twitter</a>
                </div>
            </div>

            <div className="footer-bottom container">
                <p>© 2026 CampusShare. Made with <Heart size={14} className="heart-icon" /> for students.</p>
            </div>
        </footer>
    );
}
