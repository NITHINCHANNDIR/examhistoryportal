import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    BookOpen,
    Award,
    Calendar,
    FileText,
    AlertCircle,
    CheckCircle,
    ArrowUpRight,
    Filter
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area
} from 'recharts';
import { studentApi } from '../../services/api';
import { SkeletonStats, SkeletonChart, SkeletonTable } from '../ui/Skeleton';

const StudentDashboard = () => {
    const [trends, setTrends] = useState(null);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filterSemester, setFilterSemester] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [trendsRes, resultsRes] = await Promise.all([
                studentApi.getTrends(),
                studentApi.getResults({ limit: 10 })
            ]);
            setTrends(trendsRes.data.data);
            setResults(resultsRes.data.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!results.length) {
            alert('No results to export');
            return;
        }

        const headers = ['Subject', 'Subject Code', 'Semester', 'Marks Obtained', 'Max Marks', 'Percentage', 'Grade', 'Credits', 'Academic Year', 'Status'];
        const csvContent = [
            headers.join(','),
            ...results.map(result => [
                `"${result.subjectName}"`,
                result.subjectCode,
                result.semester,
                result.marks.obtained,
                result.marks.maximum,
                result.marks.percentage,
                result.grade,
                result.credits,
                result.academicYear,
                result.anomalyFlags?.length > 0 ? 'Review Needed' : 'Verified'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academic-transcript-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const filteredResults = results.filter(result => {
        if (filterSemester === 'all') return true;
        return result.semester.toString() === filterSemester;
    });

    const semesters = [...new Set(results.map(r => r.semester))].sort((a, b) => a - b);

    // Calculate statistics
    const stats = trends ? [
        {
            label: 'CGPA',
            value: trends.cgpa?.toFixed(2) || '0.00',
            icon: Award,
            color: 'var(--color-primary)',
            bg: 'rgba(99, 102, 241, 0.1)',
            trend: '+0.15'
        },
        {
            label: 'Total Subjects',
            value: trends.totalSubjects || 0,
            icon: BookOpen,
            color: 'var(--color-secondary)',
            bg: 'rgba(6, 182, 212, 0.1)'
        },
        {
            label: 'Exams Taken',
            value: trends.totalResults || 0,
            icon: FileText,
            color: '#8b5cf6',
            bg: 'rgba(139, 92, 246, 0.1)'
        },
        {
            label: 'Semester',
            value: `Sem ${trends.semesterTrends?.length || 0}`,
            icon: Calendar,
            color: 'var(--color-accent)',
            bg: 'rgba(244, 63, 94, 0.1)'
        }
    ] : [];

    if (isLoading) {
        return (
            <div style={{ padding: '32px' }}>
                <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '300px', height: '20px', marginBottom: '32px' }} />
                <SkeletonStats count={4} />
                <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className="card"><SkeletonChart height="320px" /></div>
                    <div className="card"><SkeletonChart height="320px" /></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Dashboard Overview
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                    Welcome back! Track your performance and academic milestones.
                </p>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    marginBottom: '32px'
                }}
            >
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Decoration */}
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '80px',
                            height: '80px',
                            backgroundColor: stat.bg,
                            borderRadius: '50%',
                            filter: 'blur(20px)',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    backgroundColor: 'var(--color-card-bg, white)',
                                    border: `1.5px solid ${stat.bg}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                                }}
                            >
                                <stat.icon size={24} color={stat.color} />
                            </div>
                            {stat.trend && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    color: 'var(--color-success)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '8px'
                                }}>
                                    <TrendingUp size={14} />
                                    {stat.trend}
                                </div>
                            )}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {stat.label}
                            </p>
                            <p style={{
                                fontSize: '32px',
                                fontWeight: 800,
                                color: 'var(--color-text-primary)',
                                marginTop: '4px',
                                fontFamily: 'Outfit, sans-serif'
                            }}>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.8fr 1.2fr',
                    gap: '24px',
                    marginBottom: '32px'
                }}
            >
                {/* SGPA Trend Area Chart */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Award size={20} color="var(--color-primary)" />
                                Performance Trend
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Your GPA progression across semesters</p>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '12px' }}>
                            Full Report <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trends?.semesterTrends || []}>
                            <defs>
                                <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis
                                dataKey="semester"
                                stroke="var(--color-text-muted)"
                                fontSize={12}
                                fontWeight={600}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                format={(val) => `Sem ${val}`}
                            />
                            <YAxis
                                domain={[0, 10]}
                                stroke="var(--color-text-muted)"
                                fontSize={12}
                                fontWeight={600}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-card-bg, white)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    padding: '12px 16px'
                                }}
                                itemStyle={{ fontWeight: 700, color: 'var(--color-primary)' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sgpa"
                                name="SGPA"
                                stroke="#6366f1"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorSgpa)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject Performance */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={20} color="var(--color-secondary)" />
                            Subject Mastery
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Average marks per subject code</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={(trends?.subjectPerformance || []).slice(0, 6)}
                            layout="vertical"
                            margin={{ left: 10, right: 20 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="code"
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                                fontWeight={700}
                                width={70}
                                color="var(--color-text-primary)"
                            />
                            <Tooltip
                                contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                            />
                            <defs>
                                <linearGradient id="colorSubMastery" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <Bar
                                dataKey="avgMarks"
                                name="Mastery %"
                                fill="url(#colorSubMastery)"
                                radius={[0, 10, 10, 0]}
                                barSize={16}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Results Table */}
            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} color="var(--color-primary)" />
                            Recent Academic Records
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} /> Filter
                        </button>
                        <button className="btn btn-primary" onClick={handleExportCSV}>Download CSV</button>
                    </div>
                </div>

                {/* Filter Bar */}
                {showFilters && (
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter by Semester:</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className={`badge ${filterSemester === 'all' ? 'badge-info' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid var(--color-border)',
                                        background: filterSemester === 'all' ? 'var(--color-primary)' : 'transparent',
                                        color: filterSemester === 'all' ? 'white' : 'var(--color-text-secondary)'
                                    }}
                                    onClick={() => setFilterSemester('all')}
                                >
                                    All
                                </button>
                                {semesters.map(sem => (
                                    <button
                                        key={sem}
                                        className={`badge ${filterSemester === sem.toString() ? 'badge-info' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            border: '1px solid var(--color-border)',
                                            background: filterSemester === sem.toString() ? 'var(--color-primary)' : 'transparent',
                                            color: filterSemester === sem.toString() ? 'white' : 'var(--color-text-secondary)'
                                        }}
                                        onClick={() => setFilterSemester(sem.toString())}
                                    >
                                        Sem {sem}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ padding: '0 16px' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ padding: '16px 24px' }}>Subject</th>
                                <th>Code</th>
                                <th>Semester</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Integrity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                                        <div style={{ opacity: 0.5, marginBottom: '12px' }}><FileText size={40} style={{ margin: '0 auto' }} /></div>
                                        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No academic records match your filter</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result) => (
                                    <tr key={result._id}>
                                        <td style={{ padding: '20px 24px', fontWeight: 700 }}>{result.subjectName}</td>
                                        <td style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{result.subjectCode}</td>
                                        <td style={{ fontWeight: 600 }}>Sem {result.semester}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '15px' }}>{result.marks.obtained}</span>
                                                <div style={{
                                                    height: '6px',
                                                    width: '60px',
                                                    backgroundColor: 'var(--color-surface)',
                                                    borderRadius: '10px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${result.marks.percentage}%`,
                                                        backgroundColor: result.marks.percentage > 75 ? 'var(--color-success)' : result.marks.percentage > 40 ? 'var(--color-primary)' : 'var(--color-error)'
                                                    }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${result.grade === 'F' ? 'badge-error' :
                                                    ['A+', 'A', 'A-'].includes(result.grade) ? 'badge-success' :
                                                        'badge-info'
                                                    }`}
                                                style={{ minWidth: '32px', justifyContent: 'center' }}
                                            >
                                                {result.grade}
                                            </span>
                                        </td>
                                        <td>
                                            {result.anomalyFlags?.length > 0 ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontWeight: 600, fontSize: '13px' }}>
                                                    <AlertCircle size={16} />
                                                    AI Review
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, fontSize: '13px' }}>
                                                    <CheckCircle size={16} />
                                                    Verified
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <button style={{ border: 'none', background: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                        View Full Academic History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
