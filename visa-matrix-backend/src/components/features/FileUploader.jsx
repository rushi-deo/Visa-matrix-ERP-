import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import './FileUploader.css';

const FileUploader = ({ label, required = false }) => {
    const [files, setFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);

    // Mock upload
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles) => {
        // Add specific mock status
        const filesWithStatus = newFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            status: 'uploading'
        }));

        setFiles(prev => [...prev, ...filesWithStatus]);

        // Simulate upload finish
        filesWithStatus.forEach(f => {
            setTimeout(() => {
                setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, status: 'done' } : pf));
            }, 1500);
        });
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="file-uploader-wrapper">
            <label className="uploader-label">
                {label} {required && <span className="text-danger">*</span>}
            </label>

            <div
                className={`uploader-area ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
            >
                <UploadCloud size={32} className="uploader-icon" />
                <p className="uploader-text">Drag & Drop files here or</p>
                <label className="uploader-btn">
                    Browse Files
                    <input type="file" multiple onChange={handleFileSelect} hidden />
                </label>
            </div>

            {files.length > 0 && (
                <ul className="file-list">
                    {files.map(({ id, file, status }) => (
                        <li key={id} className="file-item">
                            <div className="file-info">
                                <File size={16} className="file-icon" />
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">({(file.size / 1024).toFixed(0)} KB)</span>
                            </div>
                            <div className="file-actions">
                                {status === 'uploading' && <span className="status-uploading">Uploading...</span>}
                                {status === 'done' && <CheckCircle size={16} className="text-accent" />}
                                <button onClick={() => removeFile(id)} className="remove-btn"><X size={16} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileUploader;
