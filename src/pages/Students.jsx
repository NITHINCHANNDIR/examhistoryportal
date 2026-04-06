import { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreVertical, Plus, Mail, BookOpen, ChevronRight, X, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editStudentForm, setEditStudentForm] = useState({
        id: '',
        firstName: '',
        lastName: '',
        studentId: '',
        email: '',
        department: '',
        batchYear: ''
    });
    const [newStudentForm, setNewStudentForm] = useState({
        firstName: '',
        lastName: '',
        studentId: '',
        email: '',
        department: '',
        batchYear: new Date().getFullYear()
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const response = await adminApi.getStudents();
            setStudents(response.data.data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminApi.addStudent(newStudentForm);
            await loadStudents();
            setIsAddModalOpen(false);
            setNewStudentForm({
                firstName: '',
                lastName: '',
                studentId: '',
                email: '',
                department: '',
                batchYear: new Date().getFullYear()
            });
            setNewStudentForm({
                firstName: '',
                lastName: '',
                studentId: '',
                email: '',
                department: '',
                batchYear: new Date().getFullYear()
            });
            toast.success('Student created successfully');
        } catch (error) {
            console.error('Error creating student:', error);
            toast.error(error.response?.data?.message || 'Failed to create student');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (e, student) => {
        e.stopPropagation();
        setIsEditModalOpen(true);
        setEditStudentForm({
            id: student._id,
            firstName: student.profile?.firstName || '',
            lastName: student.profile?.lastName || '',
            studentId: student.studentId || '',
            email: student.email || '',
            department: student.profile?.department || '',
            batchYear: student.profile?.batchYear || ''
        });
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminApi.updateStudent(editStudentForm.id, editStudentForm);
            await loadStudents();
            setIsEditModalOpen(false);
            toast.success('Student updated successfully');
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error(error.response?.data?.message || 'Failed to update student');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStudent = async (e, student) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete student ${student.profile?.firstName} ${student.profile?.lastName}?`)) return;

        try {
            await adminApi.deleteStudent(student._id);
            setStudents(students.filter(s => s._id !== student._id));
            toast.success('Student deleted successfully');
        } catch (error) {
            console.error('Failed to delete student:', error);
            toast.error(error.response?.data?.message || 'Failed to delete student');
        }
    };

    const filteredStudents = students.filter(student =>
        student.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Student Directory
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Manage {students.length} active student records.
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ gap: '8px' }}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={18} />
                    Add New Student
                </button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Visual Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="input"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '44px', boxShadow: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary">
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '32px' }}><SkeletonTable rows={8} cols={5} /></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 32px' }}>Student Name</th>
                                    <th>ID Number</th>
                                    <th>Department</th>
                                    <th>Contact</th>
                                    <th>Batch</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '80px' }}>
                                            <div style={{ opacity: 0.5, marginBottom: '16px' }}><Users size={48} style={{ margin: '0 auto' }} /></div>
                                            <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '16px' }}>No students found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${student._id}`)}>
                                            <td style={{ padding: '16px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        backgroundColor: 'var(--color-surface)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        color: 'var(--color-primary)',
                                                        fontSize: '15px'
                                                    }}>
                                                        {student.profile?.firstName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                            {student.profile?.firstName} {student.profile?.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>
                                                {student.studentId}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <BookOpen size={14} color="var(--color-text-secondary)" />
                                                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{student.profile?.department}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Mail size={14} color="var(--color-text-secondary)" />
                                                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{student.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-info">{student.profile?.batchYear}</span>
                                            </td>
                                            <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                                                    <button
                                                        style={{
                                                            padding: '6px',
                                                            color: 'var(--color-text-muted)',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '6px'
                                                        }}
                                                        className="hover:text-primary hover:bg-primary/10"
                                                        onClick={(e) => handleEditClick(e, student)}
                                                        title="Edit Student"
                                                    >
                                                        <Edit2 size={16} color="var(--color-primary)" />
                                                    </button>
                                                    <button
                                                        style={{
                                                            padding: '6px',
                                                            color: 'var(--color-text-muted)',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '6px'
                                                        }}
                                                        className="hover:text-error hover:bg-error/10"
                                                        onClick={(e) => handleDeleteStudent(e, student)}
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 size={16} color="var(--color-error)" />
                                                    </button>
                                                    <ChevronRight size={18} color="var(--color-text-muted)" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Footer Pagination (Mock) */}
                <div style={{ padding: '20px 32px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        Showing {filteredStudents.length} of {students.length} entries
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" disabled>Previous</button>
                        <button className="btn btn-secondary" disabled>Next</button>
                    </div>
                </div>
            </div>
            {/* Add Student Modal */}
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
                            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Student</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="var(--color-text-secondary)" />
                            </button>
                        </div>

                        <form onSubmit={handleAddStudent}>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>First Name</label>
                                        <input
                                            className="input"
                                            required
                                            value={newStudentForm.firstName}
                                            onChange={e => setNewStudentForm({ ...newStudentForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Last Name</label>
                                        <input
                                            className="input"
                                            required
                                            value={newStudentForm.lastName}
                                            onChange={e => setNewStudentForm({ ...newStudentForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Student ID</label>
                                    <input
                                        className="input"
                                        required
                                        placeholder="e.g. 2023CS101"
                                        value={newStudentForm.studentId}
                                        onChange={e => setNewStudentForm({ ...newStudentForm, studentId: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Email Address</label>
                                    <input
                                        className="input"
                                        type="email"
                                        required
                                        value={newStudentForm.email}
                                        onChange={e => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Department</label>
                                        <input
                                            className="input"
                                            required
                                            placeholder="e.g. Computer Science"
                                            value={newStudentForm.department}
                                            onChange={e => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Batch Year</label>
                                        <input
                                            className="input"
                                            type="number"
                                            required
                                            placeholder="e.g. 2023"
                                            value={newStudentForm.batchYear}
                                            onChange={e => setNewStudentForm({ ...newStudentForm, batchYear: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ padding: '12px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                    Default password will be set to: <strong>StudentID + FirstName (lowercase)</strong>
                                </div>

                                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Creating...' : 'Create Student'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {isEditModalOpen && (
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
                            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Edit Student</h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="var(--color-text-secondary)" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStudent}>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>First Name</label>
                                        <input
                                            className="input"
                                            required
                                            value={editStudentForm.firstName}
                                            onChange={e => setEditStudentForm({ ...editStudentForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Last Name</label>
                                        <input
                                            className="input"
                                            required
                                            value={editStudentForm.lastName}
                                            onChange={e => setEditStudentForm({ ...editStudentForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Student ID</label>
                                    <input
                                        className="input"
                                        required
                                        value={editStudentForm.studentId}
                                        onChange={e => setEditStudentForm({ ...editStudentForm, studentId: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Email Address</label>
                                    <input
                                        className="input"
                                        type="email"
                                        required
                                        value={editStudentForm.email}
                                        onChange={e => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Department</label>
                                        <input
                                            className="input"
                                            required
                                            value={editStudentForm.department}
                                            onChange={e => setEditStudentForm({ ...editStudentForm, department: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Batch Year</label>
                                        <input
                                            className="input"
                                            type="number"
                                            required
                                            value={editStudentForm.batchYear}
                                            onChange={e => setEditStudentForm({ ...editStudentForm, batchYear: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Update Student'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
