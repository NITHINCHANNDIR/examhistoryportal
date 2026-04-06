import { useCallback } from 'react';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Shield,
    GraduationCap,
    BarChart3,
    Upload,
    History,
    ClipboardList,
    LogOut
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

// eslint-disable-next-line react/prop-types
const Sidebar = ({ isCollapsed }) => {
    const { user, logout } = useAuthStore();

    const getNavItems = useCallback(() => {
        const role = user?.role || 'student';

        const studentItems = [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/results', icon: FileText, label: 'Exam Results' },
            { path: '/trends', icon: BarChart3, label: 'Performance' },
            { path: '/transcript', icon: GraduationCap, label: 'Transcript' },
        ];

        const adminItems = [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/students', icon: Users, label: 'Students' },
            { path: '/upload', icon: Upload, label: 'Upload Results' },
        ];

        const superAdminItems = [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/students', icon: Users, label: 'Students' },
            { path: '/upload', icon: Upload, label: 'Upload Results' },
            { path: '/audit-logs', icon: History, label: 'Audit Logs' },
            { path: '/users', icon: Shield, label: 'User Management' },
            { path: '/settings', icon: Settings, label: 'System Settings' },
        ];

        switch (role) {
            case 'superadmin':
                return superAdminItems;
            case 'admin':
                return adminItems;
            default:
                return studentItems;
        }
    }, [user]);

    const navItems = getNavItems();

    return (
        <aside
            className="glass"
            style={{
                width: 'var(--sidebar-collapsed-width)',
                height: 'calc(100vh - 48px)',
                borderRadius: 'var(--border-radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: '24px',
                top: '24px',
                zIndex: 50,
                boxShadow: 'var(--shadow-premium)',
                alignItems: 'center',
                padding: '32px 0'
            }}
        >
            {/* Logo */}
            <div
                style={{
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%'
                }}
            >
                <div
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                        cursor: 'default'
                    }}
                    title="ExamPortal"
                >
                    <ClipboardList size={22} color="white" />
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="group"
                        style={({ isActive }) => ({
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            boxShadow: isActive ? '0 8px 16px rgba(99, 102, 241, 0.15)' : 'none',
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />

                                {/* CSS-based Tooltip */}
                                <div className="sidebar-tooltip">
                                    {item.label}
                                    <div className="sidebar-tooltip-arrow"></div>
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div style={{ paddingBottom: '24px' }}>
                <button
                    onClick={logout}
                    className="group"
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = 'var(--color-error)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    <LogOut size={22} />

                    {/* CSS-based Tooltip */}
                    <div className="sidebar-tooltip">
                        Sign Out
                        <div className="sidebar-tooltip-arrow logout-arrow-color"></div>
                    </div>
                </button>
            </div>

            {/* Inline CSS for Tooltips to bypass potential Tailwind issues */}
            <style>{`
                .group {
                    position: relative;
                }
                .sidebar-tooltip {
                    position: absolute;
                    left: 100%;
                    margin-left: 12px;
                    padding: 8px 16px; 
                    background-color: var(--color-tooltip-bg);
                    backdrop-filter: blur(4px);
                    color: var(--color-tooltip-text);
                    font-size: 13px;
                    font-weight: 500;
                    border-radius: 8px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
                    white-space: nowrap;
                    z-index: 50;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--color-border);
                    transform: translateX(-8px) scale(0.95);
                    pointer-events: none;
                }
                .group:hover .sidebar-tooltip {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(0) scale(1);
                }
                .sidebar-tooltip-arrow {
                    position: absolute;
                    right: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border-width: 6px;
                    border-style: solid;
                    border-color: transparent var(--color-tooltip-bg) transparent transparent;
                }
                /* Logout specific overrides can be handled by inline styles if strictly needed, but let's stick to consistent dark tooltip for now as it's cleaner */
            `}</style>
        </aside>
    );
};

export default Sidebar;
