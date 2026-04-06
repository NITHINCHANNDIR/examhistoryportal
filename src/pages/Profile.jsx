import { useState } from 'react';
import { User, Mail, Shield, Key, Camera, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/useAuthStore';
import { studentApi } from '../services/api';

const Profile = () => {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    // Placeholder state for form
    const [formData, setFormData] = useState({
        firstName: user?.profile?.firstName || '',
        lastName: user?.profile?.lastName || '',
        email: user?.email || '',
        department: user?.profile?.department || '',
        userType: user?.role || 'Student'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    My Profile
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                    Manage your personal information and account security.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px', alignItems: 'start' }}>
                {/* Profile Card */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    {/* Cover Image */}
                    <div style={{
                        height: '140px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)'
                        }} />
                    </div>

                    <div style={{ padding: '0 32px 32px', marginTop: '-60px', textAlign: 'center' }}>
                        <div 
                            style={{ position: 'relative', display: 'inline-block', marginBottom: '16px', cursor: 'pointer' }}
                            onClick={() => document.getElementById('avatar-upload').click()}
                        >
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '30px',
                                border: '4px solid var(--color-card-bg, white)',
                                backgroundColor: 'var(--color-card-bg, white)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                fontWeight: 700,
                                color: 'var(--color-primary)',
                                background: 'linear-gradient(135deg, #e0e7ff, #f3e8ff)',
                                overflow: 'hidden'
                            }}>
                                {user?.profile?.avatar ? (
                                    <img 
                                        src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `http://localhost:5000/${user.profile.avatar}`} 
                                        alt="Profile" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    user?.profile?.firstName?.[0] || 'U'
                                )}
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('avatar', file);

                                    const loadingToast = toast.loading('Uploading profile picture...');
                                    try {
                                        await studentApi.updateAvatar(formData);
                                        await useAuthStore.getState().checkAuth();
                                        toast.success('Profile picture updated!', { id: loadingToast });
                                    } catch (error) {
                                        console.error('Failed to upload avatar:', error);
                                        toast.error('Failed to upload profile picture', { id: loadingToast });
                                    }
                                }}
                            />
                            <button
                                style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--color-primary)',
                                    border: '2px solid var(--color-card-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                }}>
                                <Camera size={16} />
                            </button>
                        </div>

                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {user?.profile?.firstName} {user?.profile?.lastName}
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '4px' }}>
                            {user?.email}
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                            <span className="badge badge-info" style={{ padding: '6px 16px', fontSize: '13px' }}>
                                {user?.role?.toUpperCase()}
                            </span>
                            <span className="badge badge-success" style={{ padding: '6px 16px', fontSize: '13px' }}>
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', padding: '24px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={20} color="var(--color-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 600 }}>Security Status</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 500 }}>High Strength</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Key size={20} color="var(--color-warning)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 600 }}>Last Password Change</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>30 days ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="card">
                    <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Personal Details</h3>
                        <button
                            className="btn btn-primary"
                            onClick={async () => {
                                if (isEditing) {
                                    const loadingToast = toast.loading('Saving changes...');
                                    try {
                                        await studentApi.updateProfile({
                                            firstName: formData.firstName,
                                            lastName: formData.lastName,
                                            department: formData.department
                                        });
                                        await useAuthStore.getState().checkAuth();
                                        toast.success('Profile updated successfully!', { id: loadingToast });
                                    } catch (error) {
                                        console.error('Failed to update profile:', error);
                                        toast.error('Failed to update profile', { id: loadingToast });
                                    }
                                }
                                setIsEditing(!isEditing);
                            }}
                            style={{ opacity: isEditing ? 1 : 0.5 }}
                        >
                            <Save size={18} /> {isEditing ? 'Save Changes' : 'Enable Editing'}
                        </button>
                    </div>

                    <div style={{ padding: '32px 0 0', opacity: isEditing ? 1 : 0.7, pointerEvents: isEditing ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                    First Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ paddingLeft: '48px', height: '48px' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ height: '48px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ paddingLeft: '48px', height: '48px' }}
                                    disabled
                                />
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertCircle size={14} /> Contact admin to change email address
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ height: '48px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={formData.userType}
                                    className="input"
                                    style={{ height: '48px', textTransform: 'capitalize' }}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
