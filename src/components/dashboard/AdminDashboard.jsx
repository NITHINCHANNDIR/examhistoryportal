import { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    FileText,
    Award,
    BarChart,
    BookOpen,
    Calendar,
    Star
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminApi } from '../../services/api';
import { SkeletonStats, SkeletonTable } from '../ui/Skeleton';


const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const statsRes = await adminApi.getStats();

            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };




    if (isLoading) {
        return (
            <div style={{ padding: '32px' }}>
                <div className="skeleton" style={{ width: '250px', height: '32px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '400px', height: '20px', marginBottom: '32px' }} />
                <SkeletonStats count={4} />
                <div style={{ marginTop: '32px' }}>
                    <SkeletonTable rows={5} cols={5} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Admin Command Center
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Oversee student records and manage data integrity.
                    </p>
                </div>

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
                {[
                    { label: 'Students', value: stats?.totalStudents || 0, icon: Users, color: 'var(--color-primary)', bg: 'rgba(99, 102, 241, 0.1)' },
                    { label: 'Total Results', value: stats?.totalResults || 0, icon: FileText, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
                    { label: 'Average CGPA', value: stats?.averageCGPA?.toFixed(2) || '0.00', icon: TrendingUp, color: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.1)' },
                    { label: 'Pass Rate', value: `${stats?.passRate || 100}%`, icon: Award, color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
                    { label: 'Highest CGPA', value: stats?.highestCGPA?.toFixed(2) || '0.00', icon: Star, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
                    { label: 'Total Subjects', value: stats?.totalSubjects || 0, icon: BookOpen, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
                    { label: 'Active Semesters', value: stats?.totalSemesters || 0, icon: Calendar, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' }
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: stat.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <stat.icon size={28} color={stat.color} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {stat.label}
                            </p>
                            <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Outfit, sans-serif' }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>


            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Grade Distribution Chart */}
                <div className="card">
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarChart size={22} color="var(--color-primary)" />
                            Grade Distribution
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Overall grade breakdown across all students</p>
                    </div>

                    {stats?.gradeDistribution && stats.gradeDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.gradeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ grade, percent }) => `${grade}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="grade"
                                >
                                    {stats.gradeDistribution.map((entry, index) => {
                                        const colors = {
                                            'A+': '#10b981', 'A': '#14b8a6', 'B+': '#0ea5e9', 'B': '#3b82f6',
                                            'C+': '#6366f1', 'C': '#8b5cf6', 'D': '#f59e0b', 'F': '#f43f5e'
                                        };
                                        return <Cell key={`cell-${index}`} fill={colors[entry.grade] || '#6366f1'} />;
                                    })}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.1, marginBottom: '16px' }}><BarChart size={48} style={{ margin: '0 auto' }} /></div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No grade data available</p>
                        </div>
                    )}
                </div>

                {/* Semester Performance Chart */}
                <div className="card">
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={22} color="var(--color-success)" />
                            Semester Performance
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Average marks trend across semesters</p>
                    </div>

                    {stats?.semesterPerformance && stats.semesterPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={stats.semesterPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="semester" stroke="var(--color-text-secondary)" />
                                <YAxis stroke="var(--color-text-secondary)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-card-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <defs>
                                    <linearGradient id="colorSemAdmin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <Bar dataKey="avgMarks" fill="url(#colorSemAdmin)" radius={[8, 8, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.1, marginBottom: '16px' }}><TrendingUp size={48} style={{ margin: '0 auto' }} /></div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No semester data available</p>
                        </div>
                    )}
                </div>

                {/* Subject Performance Chart */}
                <div className="card">
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={22} color="#ec4899" />
                            Top Performing Subjects
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Average marks by subject (Top 10)</p>
                    </div>

                    {stats?.subjectPerformance && stats.subjectPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={stats.subjectPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis type="number" stroke="var(--color-text-secondary)" />
                                <YAxis dataKey="subject" type="category" width={150} stroke="var(--color-text-secondary)" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-card-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <defs>
                                    <linearGradient id="colorSubAdmin" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <Bar dataKey="avgMarks" fill="url(#colorSubAdmin)" radius={[0, 8, 8, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.1, marginBottom: '16px' }}><BookOpen size={48} style={{ margin: '0 auto' }} /></div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No subject data available</p>
                        </div>
                    )}
                </div>

                {/* CGPA Distribution Chart */}
                <div className="card">
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Star size={22} color="#f59e0b" />
                            CGPA Distribution
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Student distribution across CGPA ranges</p>
                    </div>

                    {stats?.cgpaDistribution && stats.cgpaDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={stats.cgpaDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="range" stroke="var(--color-text-secondary)" />
                                <YAxis stroke="var(--color-text-secondary)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-card-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <defs>
                                    <linearGradient id="colorCgpaAdmin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <Bar dataKey="count" fill="url(#colorCgpaAdmin)" radius={[8, 8, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.1, marginBottom: '16px' }}><Star size={48} style={{ margin: '0 auto' }} /></div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No CGPA data available</p>
                        </div>
                    )}
                </div>

                {/* Department Stats Chart */}
                <div className="card">
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={22} color="#06b6d4" />
                            Department-wise Students
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Student count by department</p>
                    </div>

                    {stats?.departmentStats && stats.departmentStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.departmentStats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ department, percent }) => `${department}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="department"
                                >
                                    {stats.departmentStats.map((entry, index) => {
                                        const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6', '#0ea5e9'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.1, marginBottom: '16px' }}><Users size={48} style={{ margin: '0 auto' }} /></div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No department data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
