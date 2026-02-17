import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Upload as UploadIcon, FileText, X, Plus, Lock, Globe
} from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { RESOURCE_TYPES, SUBJECTS, BRANCHES } from '../data/mockData';
import './Upload.css';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const YEARS = ['2024', '2023', '2022', '2021', '2020'];

export default function UploadPage() {
    const navigate = useNavigate();
    const { addResource } = useResources();
    const { isAuthenticated, user, setShowAuthModal } = useAuth();

    const [form, setForm] = useState({
        title: '', description: '', subject: '', type: 'notes',
        semester: '', year: '', branch: '', privacy: 'public',
    });
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className="upload-page">
                <div className="container">
                    <div className="upload-auth glass">
                        <UploadIcon size={40} />
                        <h2>Sign in to Upload</h2>
                        <p>You need an account to share resources with the community.</p>
                        <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                            Sign In / Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 10) {
            setTags([...tags, tag]);
            setTagInput('');
        }
    };

    const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer?.files[0];
        if (dropped) setFile(dropped);
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.subject) return;

        const resourceData = {
            ...form,
            tags,
            author: user.name,
            authorCollege: user.college,
            fileName: file?.name || '',
            fileSize: file?.size || 0,
        };

        const newResource = addResource(resourceData);
        navigate(`/resource/${newResource.id}`);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="upload-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="upload-header">
                        <h1>Upload Resource</h1>
                        <p className="upload-subtitle">Share your academic resources with the community</p>
                    </div>

                    <form className="upload-form" onSubmit={handleSubmit}>
                        <div className="upload-grid">
                            {/* Left column */}
                            <div className="upload-left">
                                {/* File Drop Zone */}
                                <div
                                    className={`drop-zone glass ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    <input id="file-input" type="file" hidden onChange={handleFileChange} />
                                    {file ? (
                                        <div className="file-preview">
                                            <FileText size={32} />
                                            <div className="file-info">
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-size">{formatSize(file.size)}</span>
                                            </div>
                                            <button type="button" className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadIcon size={40} />
                                            <h3>Drop your file here</h3>
                                            <p>or click to browse (PDF, DOCX, PPT, Images)</p>
                                        </>
                                    )}
                                </div>

                                {/* Resource Details */}
                                <div className="form-card glass">
                                    <h3>Resource Details</h3>

                                    <div className="input-group">
                                        <label htmlFor="title">Title *</label>
                                        <input id="title" name="title" className="input-field" placeholder="e.g. Data Structures Notes"
                                            value={form.title} onChange={handleChange} required />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="description">Description</label>
                                        <textarea id="description" name="description" className="input-field textarea"
                                            placeholder="What's in this resource?" rows={3}
                                            value={form.description} onChange={handleChange} />
                                    </div>

                                    <div className="input-row">
                                        <div className="input-group">
                                            <label htmlFor="subject">Subject *</label>
                                            <select id="subject" name="subject" className="input-field"
                                                value={form.subject} onChange={handleChange} required>
                                                <option value="">Select</option>
                                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="type">Type *</label>
                                            <select id="type" name="type" className="input-field"
                                                value={form.type} onChange={handleChange} required>
                                                {RESOURCE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="input-row">
                                        <div className="input-group">
                                            <label htmlFor="semester">Semester</label>
                                            <select id="semester" name="semester" className="input-field"
                                                value={form.semester} onChange={handleChange}>
                                                <option value="">Select</option>
                                                {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="year">Year</label>
                                            <select id="year" name="year" className="input-field"
                                                value={form.year} onChange={handleChange}>
                                                <option value="">Select</option>
                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="branch">Branch / Department</label>
                                        <select id="branch" name="branch" className="input-field"
                                            value={form.branch} onChange={handleChange}>
                                            <option value="">Select</option>
                                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="upload-right">
                                {/* Privacy */}
                                <div className="form-card glass">
                                    <h3>Privacy Level</h3>
                                    <div className="privacy-cards">
                                        <div
                                            className={`privacy-card ${form.privacy === 'public' ? 'selected' : ''}`}
                                            onClick={() => setForm(prev => ({ ...prev, privacy: 'public' }))}
                                        >
                                            <Globe size={24} />
                                            <strong>Public</strong>
                                            <p>Anyone can view and download</p>
                                        </div>
                                        <div
                                            className={`privacy-card ${form.privacy === 'private' ? 'selected' : ''}`}
                                            onClick={() => setForm(prev => ({ ...prev, privacy: 'private' }))}
                                        >
                                            <Lock size={24} />
                                            <strong>Private</strong>
                                            <p>Only {user.college} students</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="form-card glass">
                                    <h3>Tags / Keywords</h3>
                                    <div className="tag-input-wrapper">
                                        <div className="tags-display">
                                            {tags.map(tag => (
                                                <span key={tag} className="tag-chip">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)}><X size={12} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="tag-input-row">
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Add tag..."
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                            />
                                            <button type="button" className="btn btn-secondary btn-icon" onClick={addTag}>
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button type="submit" className="btn btn-primary upload-submit">
                                    <UploadIcon size={18} /> Upload Resource
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
