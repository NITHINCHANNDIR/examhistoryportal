import { useState, useEffect } from 'react';
import { FileText, Filter, Search, ChevronDown, CheckCircle, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { studentApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

const Results = () => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterSemester, setFilterSemester] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const response = await studentApi.getResults();
            setResults(response.data.data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResults = results.filter(result => {
        const matchesSemester = filterSemester === 'all' || result.semester.toString() === filterSemester;
        const matchesSearch = result.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSemester && matchesSearch;
    });

    const semesters = [...new Set(results.map(r => r.semester))].sort((a, b) => a - b);

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Examination Results
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Comprehensive history of your academic assessments and grades.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Exams</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{results.length}</span>
                    </div>
                    <div className="card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Passed</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                            {results.filter(r => r.grade !== 'F').length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Visual Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="input"
                            placeholder="Search by subject name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '44px', boxShadow: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <select
                                className="input"
                                value={filterSemester}
                                onChange={(e) => setFilterSemester(e.target.value)}
                                style={{ paddingRight: '40px', appearance: 'none', minWidth: '160px', cursor: 'pointer' }}
                            >
                                <option value="all">All Semesters</option>
                                {semesters.map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '32px' }}><SkeletonTable rows={8} /></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 32px' }}>Subject</th>
                                    <th>Context</th>
                                    <th>Performance</th>
                                    <th>Grade</th>
                                    <th>Credits</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '80px' }}>
                                            <div style={{ opacity: 0.5, marginBottom: '16px' }}><FileText size={48} style={{ margin: '0 auto' }} /></div>
                                            <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '16px' }}>No results found</p>
                                            <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((result) => (
                                        <tr key={result._id}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '15px' }}>{result.subjectName}</p>
                                                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px', fontWeight: 500 }}>{result.subjectCode}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className="badge badge-info">Sem {result.semester}</span>
                                                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{result.academicYear}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ flex: 1, minWidth: '100px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                                            <span>{result.marks.obtained} / {result.marks.maximum}</span>
                                                            <span>{result.marks.percentage}%</span>
                                                        </div>
                                                        <div style={{ height: '6px', backgroundColor: 'var(--color-surface)', borderRadius: '10px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${result.marks.percentage}%`,
                                                                height: '100%',
                                                                backgroundColor: result.grade === 'F' ? 'var(--color-error)' : 'var(--color-primary)',
                                                                borderRadius: '10px'
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '12px',
                                                    backgroundColor: result.grade === 'F' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: result.grade === 'F' ? 'var(--color-error)' : 'var(--color-success)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: '16px'
                                                }}>
                                                    {result.grade}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                                {result.credits || 4}
                                            </td>
                                            <td>
                                                {result.anomalyFlags?.length > 0 ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontWeight: 600, fontSize: '13px', padding: '6px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                                                        <AlertCircle size={16} />
                                                        Review
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, fontSize: '13px', padding: '6px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                                                        <CheckCircle size={16} />
                                                        Verified
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn btn-secondary" style={{ padding: '8px', border: 'none', background: 'transparent' }}>
                                                    <ArrowUpRight size={18} color="var(--color-text-secondary)" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
