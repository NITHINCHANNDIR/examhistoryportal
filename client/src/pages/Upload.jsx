import { useState, useCallback } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertTriangle, RefreshCw, X, Download } from 'lucide-react';
import { adminApi } from '../services/api';

const Upload = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState('idle'); // idle, uploading, success, error
    const [uploadResult, setUploadResult] = useState(null);

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setProgress('idle');
            setUploadResult(null);
        } else {
            alert('Invalid file format. Please upload CSV or JSON.');
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer?.files?.[0];
        if (droppedFile) validateAndSetFile(droppedFile);
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setProgress('uploading');

        try {
            const response = await adminApi.uploadResults(formData);
            setUploadResult(response.data.data);
            setProgress('success');
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadResult({ message: error.response?.data?.message || 'Upload failed' });
            setProgress('error');
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ['subjectName', 'subjectCode', 'semester', 'credits', 'marksObtained', 'marksMax', 'studentEmail', 'academicYear'];
        const sampleRow = ['Mathematics', 'MATH101', '1', '4', '85', '100', 'student@example.com', '2023-2024'];

        const csvContent = [
            headers.join(','),
            sampleRow.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Data Ingestion
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Import examination results and student records in bulk.
                    </p>
                </div>
                <button className="btn btn-secondary" style={{ gap: '8px' }} onClick={handleDownloadTemplate}>
                    <Download size={18} /> Download Template
                </button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '40px' }}>
                    {/* Stepper (Simplified) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: file ? 'var(--color-success)' : 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                {file ? <CheckCircle size={16} /> : '1'}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: file ? 'var(--color-text-primary)' : 'var(--color-primary)' }}>Select File</span>
                        </div>
                        <div style={{ width: '40px', height: '2px', backgroundColor: '#e2e8f0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: progress === 'success' ? 'var(--color-success)' : progress === 'uploading' ? 'var(--color-primary)' : '#e2e8f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                2
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: progress !== 'idle' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Upload & Process</span>
                        </div>
                    </div>

                    {/* Drag & Drop Zone */}
                    {!file || progress === 'success' ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload-lg').click()}
                            style={{
                                border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                borderRadius: '24px',
                                padding: '60px',
                                textAlign: 'center',
                                backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.03)' : 'var(--color-surface)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <input id="file-upload-lg" type="file" accept=".csv,.json" onChange={(e) => validateAndSetFile(e.target.files[0])} style={{ display: 'none' }} />
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: 'var(--color-card-bg, white)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                                marginBottom: '24px'
                            }}>
                                <UploadIcon size={40} color="var(--color-primary)" />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                                Click or drag file to this area
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500, maxWidth: '400px', lineHeight: '1.5' }}>
                                Support for standard CSV or JSON result formats. Maximum file size 10MB.
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '32px',
                            backgroundColor: 'var(--color-surface)'
                        }}>
                            <div style={{ display: 'flex', items: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-card-bg, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                                        <FileText size={24} color="var(--color-text-secondary)" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '16px' }}>{file.name}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                {progress === 'idle' && (
                                    <button
                                        onClick={() => setFile(null)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px' }}
                                    >
                                        <X size={20} color="var(--color-text-secondary)" />
                                    </button>
                                )}
                            </div>

                            {progress === 'idle' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpload}
                                    style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: 600 }}
                                >
                                    Upload File
                                </button>
                            )}

                            {progress === 'uploading' && (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <RefreshCw className="animate-spin" size={32} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
                                    <p style={{ fontWeight: 600 }}>Processing data...</p>
                                </div>
                            )}

                            {progress === 'error' && (
                                <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--color-error)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={20} />
                                    {uploadResult?.message || 'Upload failed'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Success State */}
                    {progress === 'success' && uploadResult && (
                        <div style={{ marginTop: '32px', padding: '24px', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle size={32} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Upload Successful</h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                                Successfully processed <b>{uploadResult.uploaded}</b> records with <b>{uploadResult.errors}</b> errors.
                            </p>
                            <button className="btn btn-primary" onClick={() => { setFile(null); setProgress('idle'); }}>
                                Upload Another
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Upload;
