import { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Award, Target, Activity } from 'lucide-react';
import { studentApi } from '../services/api';
import { SkeletonChart, SkeletonStats } from '../components/ui/Skeleton';

const Trends = () => {
    const [trends, setTrends] = useState(null);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [trendsRes, resultsRes] = await Promise.all([
                studentApi.getTrends(),
                studentApi.getResults()
            ]);
            setTrends(trendsRes.data.data);
            setResults(resultsRes.data.data);
        } catch (error) {
            console.error('Error loading trends:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}><SkeletonStats count={4} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <SkeletonChart height="400px" />
                    <SkeletonChart height="400px" />
                </div>
            </div>
        );
    }

    // Process data for charts
    const semesterData = trends?.semesterTrends?.map(item => ({
        name: `Sem ${item.semester}`,
        sgpa: parseFloat(item.sgpa),
        cgpa: parseFloat(item.cgpa || item.sgpa) // Fallback if CGPA not available
    })) || [];

    // Subject Performance (Top 6 subjects by score)
    const subjectData = results
        .slice(0, 6)
        .map(r => ({
            subject: r.subjectCode.split('-')[0] || r.subjectCode,
            score: r.marks.percentage,
            fullMark: 100
        }));

    // Pass Fail Data
    const passCount = results.filter(r => r.grade !== 'F').length;
    const failCount = results.length - passCount;
    const passFailData = [
        { name: 'Passed', value: passCount },
        { name: 'Failed', value: failCount }
    ];
    const COLORS = ['#10b981', '#f43f5e'];

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Academic Analytics
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                    In-depth analysis of your academic performance and growth.
                </p>
            </div>

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={28} color="var(--color-primary)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Current CGPA</p>
                        <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Outfit, sans-serif' }}>{trends?.currentCGPA || '0.00'}</p>
                    </div>
                </div>
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={28} color="var(--color-success)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Best SGPA</p>
                        <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                            {Math.max(...(trends?.semesterTrends?.map(s => parseFloat(s.sgpa)) || [0])).toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={28} color="var(--color-warning)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Credits Earned</p>
                        <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                            {results.length * 4} <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>/ 120</span>
                        </p>
                    </div>
                </div>
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={28} color="var(--color-primary)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Percentile</p>
                        <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Outfit, sans-serif' }}>Top 15%</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Main Trend Chart */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Grade Progression</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(to right, #6366f1, #06b6d4)' }} /> SGPA
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #6366f1', background: 'transparent' }} /> CGPA
                            </span>
                        </div>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={semesterData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sgpa"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSgpa)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cgpa"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-card-bg, white)' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Subject Mastery</h3>
                    <div style={{ flex: 1, minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                                <PolarGrid stroke="var(--color-border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="#8b5cf6"
                                    fillOpacity={0.4}
                                />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pass/Fail & Distribution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>Success Rate</h3>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={passFailData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {passFailData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={5} />
                                    ))}
                                </Pie>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                    <tspan x="50%" dy="-10" fontSize="24" fontWeight="800" fill="var(--color-text-primary)" fontFamily="Outfit">
                                        {((passCount / results.length) * 100).toFixed(0)}%
                                    </tspan>
                                    <tspan x="50%" dy="24" fontSize="13" fontWeight="600" fill="var(--color-text-secondary)">
                                        Pass Rate
                                    </tspan>
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Semester Performance Summary</h3>
                    </div>
                    <div style={{ flex: 1, padding: '0 24px' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Semester</th>
                                    <th>Total Marks</th>
                                    <th>Percentage</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trends?.semesterTrends?.map((sem) => (
                                    <tr key={sem.semester}>
                                        <td style={{ fontWeight: 700 }}>Semester {sem.semester}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>540 / 600</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 600 }}>{((sem.sgpa / 10) * 100).toFixed(1)}%</span>
                                                <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--color-surface)', borderRadius: '10px' }}>
                                                    <div style={{ width: `${(sem.sgpa / 10) * 100}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '10px' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-success">COMPLETED</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trends;
