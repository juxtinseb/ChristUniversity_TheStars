import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, X, Check, CloudUpload, Globe, Lock, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { SUBJECTS, RESOURCE_TYPES, SEMESTERS, YEARS, BRANCHES } from '../data/mockData';
import './Upload.css';

export default function Upload() {
    const { isAuthenticated, user, setShowAuthModal } = useAuth();
    const { addResource } = useResources();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        subject: '',
        type: '',
        semester: '',
        year: '',
        branch: '',
        privacy: 'public',
        tags: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className="upload-page">
                <div className="container">
                    <div className="auth-required glass">
                        <UploadIcon size={48} className="auth-icon" />
                        <h2>Login Required</h2>
                        <p>You need to be logged in to upload resources.</p>
                        <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                            Log In / Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragIn = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
    const handleDragOut = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragging(false);
        if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
    };
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
            setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
        if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
            removeTag(form.tags[form.tags.length - 1]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.subject || !form.type) return;

        addResource({
            ...form,
            author: user.name,
            authorCollege: user.college,
            authorAvatar: null,
            fileUrl: '#',
        });

        setSubmitted(true);
        setTimeout(() => navigate('/browse'), 2000);
    };

    if (submitted) {
        return (
            <div className="upload-page">
                <div className="container">
                    <motion.div
                        className="upload-success glass"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        <div className="success-icon">
                            <Check size={40} />
                        </div>
                        <h2>Resource Uploaded Successfully!</h2>
                        <p>Your resource is now available for other students.</p>
                        <p className="redirect-note">Redirecting to browse page...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="upload-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="section-title">Upload Resource</h1>
                    <p className="section-subtitle">Share your academic materials with the community</p>
                </motion.div>

                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="upload-grid">
                        {/* Left: File Upload + Privacy */}
                        <motion.div
                            className="upload-left"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <div
                                className={`dropzone glass ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                                onDragEnter={handleDragIn}
                                onDragLeave={handleDragOut}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="file-input"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                                />
                                {file ? (
                                    <div className="file-preview">
                                        <FileText size={40} className="file-icon" />
                                        <p className="file-name">{file.name}</p>
                                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button type="button" className="btn btn-ghost file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                            <X size={16} /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="dropzone-content">
                                        <CloudUpload size={48} className="dropzone-icon" />
                                        <h3>Drag & drop your file here</h3>
                                        <p>or click to browse</p>
                                        <span className="dropzone-hint">PDF, DOC, PPT, ZIP (max 50MB)</span>
                                    </div>
                                )}
                            </div>

                            {/* Privacy Setting */}
                            <div className="privacy-card glass">
                                <h3 className="privacy-title">Access Control</h3>
                                <p className="privacy-desc">
                                    Choose who can view and download this resource
                                </p>
                                <div className="privacy-options">
                                    <button
                                        type="button"
                                        className={`privacy-option ${form.privacy === 'public' ? 'active public' : ''}`}
                                        onClick={() => updateForm('privacy', 'public')}
                                    >
                                        <Globe size={20} />
                                        <div>
                                            <strong>Public</strong>
                                            <span>Anyone from any college can access</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`privacy-option ${form.privacy === 'private' ? 'active private' : ''}`}
                                        onClick={() => updateForm('privacy', 'private')}
                                    >
                                        <Lock size={20} />
                                        <div>
                                            <strong>Private</strong>
                                            <span>Only students from {user.college} can access</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Form Fields */}
                        <motion.div
                            className="upload-right"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <div className="form-card glass">
                                <div className="input-group">
                                    <label htmlFor="upload-title">Title *</label>
                                    <input
                                        id="upload-title"
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Data Structures — Complete Notes"
                                        value={form.title}
                                        onChange={(e) => updateForm('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="upload-desc">Description</label>
                                    <textarea
                                        id="upload-desc"
                                        className="input-field textarea"
                                        placeholder="Describe what this resource covers..."
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => updateForm('description', e.target.value)}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="upload-subject">Subject *</label>
                                        <select id="upload-subject" className="input-field" value={form.subject} onChange={(e) => updateForm('subject', e.target.value)} required>
                                            <option value="">Select subject</option>
                                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="upload-type">Resource Type *</label>
                                        <select id="upload-type" className="input-field" value={form.type} onChange={(e) => updateForm('type', e.target.value)} required>
                                            <option value="">Select type</option>
                                            {RESOURCE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="upload-branch">Branch / Department</label>
                                        <select id="upload-branch" className="input-field" value={form.branch} onChange={(e) => updateForm('branch', e.target.value)}>
                                            <option value="">Select branch</option>
                                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="upload-semester">Semester</label>
                                        <select id="upload-semester" className="input-field" value={form.semester} onChange={(e) => updateForm('semester', e.target.value)}>
                                            <option value="">Select semester</option>
                                            {SEMESTERS.map(s => <option key={s} value={s}>{s} Semester</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="upload-year">Year</label>
                                    <select id="upload-year" className="input-field" value={form.year} onChange={(e) => updateForm('year', e.target.value)}>
                                        <option value="">Select year</option>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="input-group">
                                    <label>Tags / Keywords</label>
                                    <div className="tags-input-wrap">
                                        {form.tags.map(tag => (
                                            <span key={tag} className="tag-chip">
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)}><X size={12} /></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="tag-input"
                                            placeholder={form.tags.length === 0 ? 'Type and press Enter...' : 'Add more...'}
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                        />
                                    </div>
                                    <small className="tag-hint">{form.tags.length}/8 tags · Press Enter or comma to add</small>
                                </div>

                                <button type="submit" className="btn btn-primary upload-submit">
                                    <UploadIcon size={18} />
                                    Upload Resource
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </form>
            </div>
        </div>
    );
}
