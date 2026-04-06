import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Info, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { adminApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

const Insights = () => {
    const [insights, setInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            const response = await adminApi.getInsights();
            setInsights(response.data.data);
        } catch (error) {
            console.error('Error loading insights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            await adminApi.acknowledgeInsight(id);
            setInsights(insights.map(i => i._id === id ? { ...i, acknowledgedBy: 'admin' } : i));
        } catch (error) {
            console.error('Failed to acknowledge:', error);
        }
    };

    const pendingInsights = insights.filter(i => !i.acknowledgedBy);
    const historyInsights = insights.filter(i => i.acknowledgedBy);

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical':
                return {
                    bg: 'rgba(244, 63, 94, 0.1)',
                    border: 'rgba(244, 63, 94, 0.3)',
                    iconBg: 'rgba(244, 63, 94, 0.2)',
                    iconColor: '#f43f5e',
                    icon: AlertTriangle
                };
            case 'high':
                return {
                    bg: 'rgba(249, 115, 22, 0.1)',
                    border: 'rgba(249, 115, 22, 0.3)',
                    iconBg: 'rgba(249, 115, 22, 0.2)',
                    iconColor: '#f97316',
                    icon: Zap
                };
            default:
                return {
                    bg: 'var(--color-surface)',
                    border: 'var(--color-border)',
                    iconBg: 'var(--color-card-bg)',
                    iconColor: 'var(--color-text-secondary)',
                    icon: Info
                };
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    AI Batch Insights
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                    Actionable intelligence and pattern detection by Antigravity Agents.
                </p>
            </div>

            {isLoading ? (
                <div style={{ padding: '32px' }}><SkeletonTable rows={4} cols={2} /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '32px' }}>
                    {/* Pending Insights Feed */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
                                Active Alerts
                            </h3>
                            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{pendingInsights.length} pending</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pendingInsights.length === 0 ? (
                                <div className="card" style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderStyle: 'dashed' }}>
                                    <CheckCircle size={32} color="var(--color-success)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                                    <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>All systems normal</p>
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>No actionable insights pending review.</p>
                                </div>
                            ) : (
                                pendingInsights.map((insight) => {
                                    const styles = getSeverityStyles(insight.severity);
                                    const Icon = styles.icon;
                                    return (
                                        <div key={insight._id} className="card" style={{
                                            padding: '24px',
                                            borderLeft: `4px solid ${styles.iconColor}`,
                                            display: 'flex',
                                            gap: '20px'
                                        }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                backgroundColor: styles.iconBg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Icon size={24} color={styles.iconColor} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                                        {insight.insightType.replace(/_/g, ' ')}
                                                    </h4>
                                                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                                        {new Date(insight.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.5', marginBottom: '16px' }}>
                                                    {insight.data?.summary}
                                                </p>

                                                {/* Details Block */}
                                                {insight.data?.details && (
                                                    <div style={{
                                                        padding: '12px 16px',
                                                        backgroundColor: styles.bg,
                                                        borderRadius: '8px',
                                                        marginBottom: '16px',
                                                        fontSize: '13px',
                                                        color: 'var(--color-text-secondary)'
                                                    }}>
                                                        <p style={{ fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Analysis Data</p>
                                                        {JSON.stringify(insight.data.details).substring(0, 100)}...
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button
                                                        onClick={() => handleAcknowledge(insight._id)}
                                                        className="btn btn-primary"
                                                        style={{ padding: '8px 16px', fontSize: '13px', height: 'auto' }}
                                                    >
                                                        Acknowledge
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '8px 16px', fontSize: '13px', height: 'auto', backgroundColor: 'var(--color-card-bg)' }}
                                                    >
                                                        Investigate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-text-muted)' }} />
                            Resolved History
                        </h3>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {historyInsights.length === 0 ? (
                                <div style={{ padding: '32px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No resolved insights yet.</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {historyInsights.map((insight) => (
                                        <div key={insight._id} style={{
                                            padding: '16px',
                                            borderBottom: '1px solid var(--color-border)',
                                            opacity: 0.7,
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                                    {insight.insightType.replace(/_/g, ' ')}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                                    {new Date(insight.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {insight.data?.summary}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                <button style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                    View Full Archive <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Insights;
