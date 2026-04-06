import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, BookOpen, AlertCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { adminApi } from '../services/api';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [results, setResults] = useState([]);
    const [cgpa, setCgpa] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [editingResult, setEditingResult] = useState(null);
    const [editForm, setEditForm] = useState({ marks: '', grade: '' });

    // State for adding new result
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newResultForm, setNewResultForm] = useState({
        examName: '',
        subjectCode: '',
        subjectName: '',
        marks: { obtained: '', maximum: 100 },
        grade: '',
        credits: 3,
        semester: 1,
        academicYear: new Date().getFullYear().toString()
    });

    // State for delete confirmation
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [resultToDelete, setResultToDelete] = useState(null);

    useEffect(() => {
        loadStudentDetails();
    }, [id]);

    const loadStudentDetails = async () => {
        try {
            const response = await adminApi.getStudentDetails(id);
            setStudent(response.data.data.student);
            setResults(response.data.data.results);
            setCgpa(response.data.data.cgpa);
        } catch (error) {
            console.error('Error loading student details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (result) => {
        setEditingResult(result._id);
        setEditForm({
            marks: result.marks.obtained,
            grade: result.grade
        });
    };

    const handleCancelEdit = () => {
        setEditingResult(null);
        setEditForm({ marks: '', grade: '' });
    };

    const handleSaveEdit = async (resultId) => {
        setIsSaving(true);
        try {
            await adminApi.updateResult(resultId, {
                marks: { obtained: editForm.marks },
                grade: editForm.grade
            });
            await loadStudentDetails();
            setEditingResult(null);
            toast.success('Result updated successfully');
        } catch (error) {
            console.error('Error updating result:', error);
            toast.error('Failed to update result');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddClick = () => {
        setIsAddModalOpen(true);
        // Reset form or set defaults based on student profile if needed
        setNewResultForm({
            examName: '',
            subjectCode: '',
            subjectName: '',
            marks: { obtained: '', maximum: 100 },
            grade: '',
            credits: 3,
            semester: student?.profile?.semester || 1,
            academicYear: student?.profile?.batchYear ? `${student.profile.batchYear}-${student.profile.batchYear + 4}` : new Date().getFullYear().toString(),
        });
    };

    const handleSaveNewResult = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await adminApi.addResult({
                studentId: student.studentId,
                ...newResultForm
            });
            await loadStudentDetails();
            setIsAddModalOpen(false);
            toast.success('Result added successfully');
        } catch (error) {
            console.error('Error adding result:', error);
            toast.error('Failed to add result');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteResult = (resultId) => {
        setResultToDelete(resultId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteResult = async () => {
        if (!resultToDelete) return;

        setIsSaving(true);
        try {
            await adminApi.deleteResult(resultToDelete);
            await loadStudentDetails();
            toast.success('Result deleted successfully');
            setIsDeleteModalOpen(false);
            setResultToDelete(null);
        } catch (error) {
            console.error('Error deleting result:', error);
            toast.error('Failed to delete result');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading student details...</div>;
    }

    if (!student) {
        return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Student not found</div>;
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/students')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    marginBottom: '24px',
                    fontSize: '14px',
                    fontWeight: 500
                }}
            >
                <ArrowLeft size={16} /> Back to Directory
            </button>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        backgroundColor: 'var(--color-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        {student.profile?.firstName?.[0]}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                            {student.profile?.firstName} {student.profile?.lastName}
                        </h1>
                        <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ opacity: 0.7 }}>ID:</span>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{student.studentId}</span>
                            </span>
                            <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)' }}></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ opacity: 0.7 }}>Dept:</span>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{student.profile?.department}</span>
                            </span>
                            <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)' }}></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ opacity: 0.7 }}>Batch:</span>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{student.profile?.batchYear}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall CGPA</span>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>{cgpa}</span>
                </div>
            </div>

            {/* Results Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '20px 32px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={18} color="var(--color-primary)" />
                        Academic Records
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className="badge badge-info">{results.length} Entries</span>
                        <button className="btn btn-primary" onClick={handleAddClick} style={{ padding: '8px 16px', fontSize: '13px' }}>
                            <Plus size={16} /> Add Result
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '32px' }}>Semester</th>
                                <th>Subject Code</th>
                                <th>Subject Name</th>
                                <th>Marks</th>
                                <th>Grade</th>
                                <th>Credit</th>
                                <th style={{ textAlign: 'right', paddingRight: '32px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                                        No academic records found. Add a new result to get started.
                                    </td>
                                </tr>
                            ) : (
                                results.map((result) => (
                                    <tr key={result._id}>
                                        <td style={{ paddingLeft: '32px' }}>
                                            <span style={{ fontWeight: 500 }}>Sem {result.semester}</span>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{result.academicYear}</div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{result.subjectCode}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{result.subjectName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{result.examName}</div>
                                        </td>
                                        <td>
                                            {editingResult === result._id ? (
                                                <input
                                                    className="input"
                                                    type="number"
                                                    value={editForm.marks}
                                                    onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })}
                                                    style={{ width: '80px', padding: '4px 8px' }}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>{result.marks.obtained}</span>
                                            )}
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}> / {result.marks.maximum}</span>
                                        </td>
                                        <td>
                                            {editingResult === result._id ? (
                                                <select
                                                    className="input"
                                                    value={editForm.grade}
                                                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                                                    style={{ width: '80px', padding: '4px 8px' }}
                                                >
                                                    {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'AB'].map(g => (
                                                        <option key={g} value={g}>{g}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`badge ${['A+', 'A'].includes(result.grade) ? 'badge-success' :
                                                    ['B+', 'B'].includes(result.grade) ? 'badge-info' :
                                                        ['F', 'AB'].includes(result.grade) ? 'badge-error' : 'badge-warning'
                                                    }`}>
                                                    {result.grade}
                                                </span>
                                            )}
                                        </td>
                                        <td>{result.credits}</td>
                                        <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                                            {editingResult === result._id ? (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '6px' }}
                                                        onClick={() => handleSaveEdit(result._id)}
                                                        disabled={isSaving}
                                                    >
                                                        <Save size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px' }}
                                                        onClick={handleCancelEdit}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}
                                                        onClick={() => handleEditClick(result)}
                                                    >
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                                        onClick={() => handleDeleteResult(result._id)}
                                                        title="Delete Result"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warning Note */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
            }}>
                <AlertCircle size={20} color="var(--color-warning)" style={{ marginTop: '2px' }} />
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-warning)', marginBottom: '4px' }}>Important Note</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                        Manually creating or updating exam results will create an audit trail entry.
                        The digital signature for the record will be generated automatically. Please verify all details before saving.
                    </p>
                </div>
            </div>

            {/* Add Result Modal */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Result</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="var(--color-text-secondary)" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewResult}>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Exam Name</label>
                                    <input
                                        className="input"
                                        required
                                        placeholder="e.g. End Semester Examination Dec 2025"
                                        value={newResultForm.examName}
                                        onChange={e => setNewResultForm({ ...newResultForm, examName: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Subject Code</label>
                                        <input
                                            className="input"
                                            required
                                            placeholder="e.g. CS101"
                                            value={newResultForm.subjectCode}
                                            onChange={e => setNewResultForm({ ...newResultForm, subjectCode: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Semester</label>
                                        <input
                                            className="input"
                                            type="number"
                                            required
                                            min="1" max="10"
                                            value={newResultForm.semester}
                                            onChange={e => setNewResultForm({ ...newResultForm, semester: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Subject Name</label>
                                    <input
                                        className="input"
                                        required
                                        placeholder="e.g. Introduction to Programming"
                                        value={newResultForm.subjectName}
                                        onChange={e => setNewResultForm({ ...newResultForm, subjectName: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Marks Obtained</label>
                                        <input
                                            className="input"
                                            type="number"
                                            required
                                            value={newResultForm.marks.obtained}
                                            onChange={e => setNewResultForm({ ...newResultForm, marks: { ...newResultForm.marks, obtained: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Max Marks</label>
                                        <input
                                            className="input"
                                            type="number"
                                            required
                                            value={newResultForm.marks.maximum}
                                            onChange={e => setNewResultForm({ ...newResultForm, marks: { ...newResultForm.marks, maximum: e.target.value } })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Grade</label>
                                        <select
                                            className="input"
                                            required
                                            value={newResultForm.grade}
                                            onChange={e => setNewResultForm({ ...newResultForm, grade: e.target.value })}
                                        >
                                            <option value="">Select Grade</option>
                                            {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'AB'].map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Credits</label>
                                        <input
                                            className="input"
                                            type="number"
                                            required
                                            value={newResultForm.credits}
                                            onChange={e => setNewResultForm({ ...newResultForm, credits: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Academic Year</label>
                                    <input
                                        className="input"
                                        required
                                        placeholder="e.g. 2025-2026"
                                        value={newResultForm.academicYear}
                                        onChange={e => setNewResultForm({ ...newResultForm, academicYear: e.target.value })}
                                    />
                                </div>

                                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Add Result'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteResult}
                title="Delete Result"
                message="Are you sure you want to delete this academic record? This action cannot be undone and will affect the student's CGPA."
                confirmText="Delete"
                isDangerous={true}
                isLoading={isSaving}
            />
        </div>
    );
};

export default StudentDetails;
