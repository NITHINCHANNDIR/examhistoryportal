import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Lock, User, Save, Moon, Sun, Monitor, AlertCircle } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import useThemeStore from '../stores/useThemeStore';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const { theme: currentTheme, setTheme } = useThemeStore();
    const { user } = useAuthStore();

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Appearance</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                {[
                                    { id: 'light', icon: Sun, label: 'Light' },
                                    { id: 'dark', icon: Moon, label: 'Dark' },
                                    { id: 'system', icon: Monitor, label: 'System' },
                                ].map((themeOption) => (
                                    <button
                                        key={themeOption.id}
                                        onClick={() => setTheme(themeOption.id)}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '16px',
                                            border: `2px solid ${currentTheme === themeOption.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            backgroundColor: 'var(--color-card-bg, white)',
                                            color: 'var(--color-text-primary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <themeOption.icon size={24} color={currentTheme === themeOption.id ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
                                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{themeOption.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>System Preferences</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '15px' }}>Academic Year</p>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Set the default academic year for reports.</p>
                                    </div>
                                    <select className="input" style={{ width: '180px' }}>
                                        <option>2023-2024</option>
                                        <option>2024-2025</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '15px' }}>Maintenance Mode</p>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Disable student access during updates.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Password & Authentication</h3>
                            <div style={{ maxWidth: '480px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Current Password</label>
                                    <input type="password" className="input" placeholder="••••••••" style={{ height: '44px' }} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>New Password</label>
                                    <input type="password" className="input" placeholder="••••••••" style={{ height: '44px' }} />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Confirm New Password</label>
                                    <input type="password" className="input" placeholder="••••••••" style={{ height: '44px' }} />
                                </div>
                                <button className="btn btn-primary">Update Password</button>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Two-Factor Authentication</h3>
                            <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', display: 'flex', gap: '16px' }}>
                                <AlertCircle color="var(--color-warning)" />
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '14px', color: '#b45309' }}>2FA Not Configured</p>
                                    <p style={{ fontSize: '13px', color: '#b45309', marginTop: '4px' }}>
                                        Add an extra layer of security to your admin account.
                                    </p>
                                    <button style={{ marginTop: '12px', background: 'var(--color-card-bg, white)', border: '1px solid #b45309', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#b45309', cursor: 'pointer' }}>
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Email Notifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {[
                                    'New student registration alert',
                                    'System anomaly detected',
                                    'Daily backup summary',
                                    'Weekly performance report'
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 500 }}>{item}</span>
                                        <label className="switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'white', fontWeight: 700 }}>
                                {user?.profile?.firstName?.[0] || 'U'}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    {user?.profile?.firstName} {user?.profile?.lastName}
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                    {user?.role?.toUpperCase()}
                                </p>
                            </div>
                            <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>Change Avatar</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>First Name</label>
                                <input className="input" defaultValue={user?.profile?.firstName} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Last Name</label>
                                <input className="input" defaultValue={user?.profile?.lastName} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Email Address</label>
                            <input className="input" defaultValue={user?.email} disabled style={{ backgroundColor: 'var(--color-surface)', cursor: 'not-allowed', opacity: 0.7 }} />
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Bio</label>
                            <textarea className="input" rows="4" placeholder="Tell us about yourself..." />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" style={{ gap: '8px' }}>
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Settings
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                    Manage account settings and system preferences.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>
                {/* Sidebar */}
                <div className="card" style={{ padding: '16px' }}>
                    {[
                        { id: 'general', icon: SettingsIcon, label: 'General' },
                        { id: 'security', icon: Lock, label: 'Security' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'profile', icon: User, label: 'Profile' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === item.id ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === item.id ? 'white' : 'var(--color-text-secondary)',
                                fontWeight: activeTab === item.id ? 700 : 500,
                                cursor: 'pointer',
                                marginBottom: '4px',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="card" style={{ padding: '40px', minHeight: '500px' }}>
                    {renderTabContent()}
                </div>
            </div>

            <style jsx>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .switch input { 
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #cbd5e1;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                }
                input:checked + .slider {
                    background-color: var(--color-primary);
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                }
                .slider.round {
                    border-radius: 34px;
                }
                .slider.round:before {
                    border-radius: 50%;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Settings;
