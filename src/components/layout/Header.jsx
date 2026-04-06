import { useState } from 'react';
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

const Header = ({ onSearchClick }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [notifications] = useState([]);

    return (
        <header
            className="glass"
            style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                position: 'sticky',
                top: 0,
                zIndex: 30,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
        >
            {/* Search Bar - Modern Integrated Style */}
            <button
                onClick={onSearchClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    minWidth: '400px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-card-bg)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
                }}
            >
                <Search size={18} color="var(--color-primary)" />
                <span style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '14px',
                    flex: 1,
                    textAlign: 'left',
                    fontWeight: 500
                }}>
                    Search students, exams, results...
                </span>
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                    padding: '4px 8px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)'
                }}>
                    <span style={{ fontSize: '12px' }}>⌘</span>K
                </div>
            </button>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Notifications */}
                <Menu as="div" style={{ position: 'relative' }}>
                    <Menu.Button
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            backgroundColor: 'var(--color-card-bg, #ffffff)',
                            border: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Bell size={20} color="var(--color-text-secondary)" />
                        {notifications.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: 'var(--color-accent)',
                                border: '2px solid white',
                                borderRadius: '50%'
                            }} />
                        )}
                    </Menu.Button>
                    <Transition
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                        <Menu.Items
                            style={{
                                position: 'absolute',
                                right: 0,
                                marginTop: '12px',
                                width: '360px',
                                backgroundColor: 'var(--color-card-bg, #ffffff)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                                padding: '12px',
                                outline: 'none'
                            }}
                        >
                            <div style={{ padding: '12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Notifications</h3>
                                <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Mark all as read</span>
                            </div>
                            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: 'var(--color-surface)',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Bell size={24} color="#94a3b8" />
                                </div>
                                <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>All caught up!</p>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>No new notifications to show right now.</p>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>

                {/* User Menu */}
                <Menu as="div" style={{ position: 'relative' }}>
                    <Menu.Button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '6px 6px 6px 16px',
                            backgroundColor: 'var(--color-card-bg, #ffffff)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                        }}
                    >
                        <div style={{ textAlign: 'right' }}>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                lineHeight: 1.2
                            }}>
                                {user?.profile?.firstName || 'User'}
                            </p>
                            <p style={{
                                fontSize: '11px',
                                color: 'var(--color-text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontWeight: 600
                            }}>
                                {user?.role || 'Student'}
                            </p>
                        </div>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 700,
                                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
                                overflow: 'hidden'
                            }}
                        >
                            {user?.profile?.avatar ? (
                                <img 
                                    src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `http://localhost:5000/${user.profile.avatar}`} 
                                    alt="DP" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                    </Menu.Button>
                    <Transition
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                        <Menu.Items
                            style={{
                                position: 'absolute',
                                right: 0,
                                marginTop: '12px',
                                width: '240px',
                                backgroundColor: 'var(--color-card-bg, #ffffff)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                                padding: '8px',
                                outline: 'none'
                            }}
                        >
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>
                                    {user?.profile?.firstName} {user?.profile?.lastName}
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                                    {user?.email}
                                </p>
                            </div>

                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => navigate('/profile')}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            backgroundColor: active ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                            fontWeight: 600,
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: active ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-surface)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <User size={16} />
                                        </div>
                                        Profile
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => navigate('/settings')}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            backgroundColor: active ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                            fontWeight: 600,
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: active ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-surface)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <Settings size={16} />
                                        </div>
                                        Settings
                                    </button>
                                )}
                            </Menu.Item>

                            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />

                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={logout}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            backgroundColor: active ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: active ? '#ef4444' : 'var(--color-error)',
                                            fontWeight: 600,
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <LogOut size={16} />
                                        </div>
                                        Logout
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
};

export default Header;
