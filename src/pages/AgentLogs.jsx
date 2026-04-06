import { useState, useEffect } from 'react';
import { Bot, RefreshCw, CheckCircle, AlertTriangle, Clock, Search, Filter, ArrowUpRight } from 'lucide-react';
import { adminApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

const AgentLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadLogs();
        const interval = setInterval(loadLogs, 10000); // 10s Poll
        return () => clearInterval(interval);
    }, []);

    const loadLogs = async () => {
        try {
            // In a real app we might append or merge, simplify for now
            const response = await adminApi.getAgentLogs({ limit: 50 });
            setLogs(response.data.data);
        } catch (error) {
            console.error('Error loading agent logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        filterStatus === 'all' || log.status === filterStatus
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--color-success)';
            case 'failed': return 'var(--color-error)';
            case 'running': return 'var(--color-primary)';
            case 'grounded': return 'var(--color-warning)';
            default: return 'var(--color-text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return CheckCircle;
            case 'failed': return AlertTriangle;
            case 'running': return RefreshCw;
            default: return Clock;
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Agent Execution Logs
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Real-time monitoring of Antigravity Agent operations and tasks.
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => { setIsLoading(true); loadLogs(); }}
                    disabled={isLoading}
                    style={{ gap: '8px' }}
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh Logs
                </button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} color="var(--color-text-secondary)" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter Status:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'running', 'completed', 'failed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: filterStatus === status ? 'var(--color-card-bg)' : 'transparent',
                                    boxShadow: filterStatus === status ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    color: filterStatus === status ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && logs.length === 0 ? (
                    <div style={{ padding: '32px' }}><SkeletonTable rows={10} cols={6} /></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 24px' }}>Task Description</th>
                                    <th>Status</th>
                                    <th>Trigger Type</th>
                                    <th>Duration</th>
                                    <th>Timeline</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No logs found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const StatusIcon = getStatusIcon(log.status);
                                        return (
                                            <tr key={log._id}>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div>
                                                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                                            {log.taskType.replace(/_/g, ' ').toUpperCase()}
                                                        </p>
                                                        {log.metadata?.fileId && (
                                                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontFamily: 'monospace' }}>
                                                                ID: {log.metadata.fileId.substring(0, 8)}...
                                                            </p>
                                                        )}
                                                        {log.error && (
                                                            <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                Error: {log.error}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '6px 10px',
                                                        borderRadius: '8px',
                                                        backgroundColor: log.status === 'failed' ? 'rgba(239, 68, 68, 0.05)' : log.status === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(99, 102, 241, 0.05)',
                                                        color: getStatusColor(log.status),
                                                        fontWeight: 700,
                                                        fontSize: '12px'
                                                    }}>
                                                        <StatusIcon size={14} />
                                                        {log.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                                                        {log.triggeredBy}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                                    {log.metrics?.duration ? `${(log.metrics.duration / 1000).toFixed(2)}s` : '-'}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                            {new Date(log.createdAt).toLocaleTimeString()}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                                            {new Date(log.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '6px', border: 'none', background: 'transparent' }}>
                                                        <ArrowUpRight size={18} color="var(--color-text-secondary)" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentLogs;
