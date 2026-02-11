import { useState, useEffect } from 'react';
import { Shield, UserPlus, Search, MoreHorizontal, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { superAdminApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        email: ''
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await superAdminApi.getUsers();
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await superAdminApi.toggleUserStatus(id);
            setUsers(users.map(u => u._id === id ? { ...u, active: !u.active } : u));
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await superAdminApi.createAdmin(newAdmin);
            setShowAddModal(false);
            setNewAdmin({ email: '' });
            loadUsers(); // Reload users list
            alert('Admin created successfully! The default password is "Admin@123". The user will be asked to change it on first login.');
        } catch (error) {
            console.error('Failed to create admin:', error);
            alert(error.response?.data?.message || 'Failed to create admin');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) return;

        try {
            await superAdminApi.deleteUser(user._id);
            setUsers(users.filter(u => u._id !== user._id));
            alert('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        User Administration
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Manage access controls and roles for {users.length} registered accounts.
                    </p>
                </div>
                <button className="btn btn-primary" style={{ gap: '8px' }} onClick={() => setShowAddModal(true)}>
                    <UserPlus size={18} />
                    Add Administrator
                </button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                }}>
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                        <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="input"
                            placeholder="Find user by email or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '44px', boxShadow: 'none' }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '32px' }}><SkeletonTable rows={8} cols={5} /></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 32px' }}>User Details</th>
                                    <th>Role</th>
                                    <th>Last Login</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No users found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td style={{ padding: '20px 32px' }}>
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
                                                        color: 'var(--color-text-primary)'
                                                    }}>
                                                        {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                                                            {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'System User'}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.role === 'superadmin' ? 'badge-primary' : user.role === 'admin' ? 'badge-info' : 'badge-secondary'}`}>
                                                    {user.role ? user.role.toUpperCase() : 'STUDENT'}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </td>
                                            <td>
                                                {user.active ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, fontSize: '13px' }}>
                                                        <CheckCircle size={14} /> Active
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>
                                                        <XCircle size={14} /> Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '8px 12px', height: 'auto', fontSize: '13px' }}
                                                        onClick={() => handleToggleStatus(user._id)}
                                                    >
                                                        {user.active ? 'Suspend' : 'Activate'}
                                                    </button>

                                                    {user.role !== 'superadmin' && (
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ padding: '8px', color: 'var(--color-error)' }}
                                                            onClick={() => handleDeleteUser(user)}
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setShowAddModal(false)}>
                    <div className="card" style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '32px'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                            Create Administrator
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                            Add a new administrator to the system
                        </p>

                        <form onSubmit={handleCreateAdmin}>
                            <div style={{ marginBottom: '24px' }}>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    required
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    placeholder="admin@example.com"
                                />
                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                                    The new admin will log in using this email and default password <strong>Admin@123</strong>.
                                    They will be prompted to set up their profile and change their password on first login.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isCreating}
                                >
                                    {isCreating ? 'Creating...' : 'Create Administrator'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
