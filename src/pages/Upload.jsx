import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, X, Check, CloudUpload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { SUBJECTS, RESOURCE_TYPES, SEMESTERS, YEARS } from '../data/mockData';
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
    });
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

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const updateForm = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.subject || !form.type) return;

        addResource({
            ...form,
            author: user.name,
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
                        {/* Left: File Upload */}
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
                                        <button
                                            type="button"
                                            className="btn btn-ghost file-remove"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        >
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
                                        <select
                                            id="upload-subject"
                                            className="input-field"
                                            value={form.subject}
                                            onChange={(e) => updateForm('subject', e.target.value)}
                                            required
                                        >
                                            <option value="">Select subject</option>
                                            {SUBJECTS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="upload-type">Resource Type *</label>
                                        <select
                                            id="upload-type"
                                            className="input-field"
                                            value={form.type}
                                            onChange={(e) => updateForm('type', e.target.value)}
                                            required
                                        >
                                            <option value="">Select type</option>
                                            {RESOURCE_TYPES.map(t => (
                                                <option key={t.id} value={t.id}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="upload-semester">Semester</label>
                                        <select
                                            id="upload-semester"
                                            className="input-field"
                                            value={form.semester}
                                            onChange={(e) => updateForm('semester', e.target.value)}
                                        >
                                            <option value="">Select semester</option>
                                            {SEMESTERS.map(s => (
                                                <option key={s} value={s}>{s} Semester</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="upload-year">Year</label>
                                        <select
                                            id="upload-year"
                                            className="input-field"
                                            value={form.year}
                                            onChange={(e) => updateForm('year', e.target.value)}
                                        >
                                            <option value="">Select year</option>
                                            {YEARS.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
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
