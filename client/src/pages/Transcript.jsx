import { useState, useEffect } from 'react';
import { GraduationCap, Download, Printer, ShieldCheck, Share2 } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import { studentApi } from '../services/api'; // Import studentApi
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
import toast from 'react-hot-toast';
import TranscriptDocument from '../components/TranscriptDocument';

const Transcript = () => {
    const { user } = useAuthStore();
    const [transcriptData, setTranscriptData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const response = await studentApi.getTranscript();
                setTranscriptData(response.data.data);
            } catch (error) {
                console.error('Error fetching transcript:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchTranscript();
        }
    }, [user]);

    const handleShare = async () => {
        if (!navigator.share) {
            toast.error('Web Share API not supported on this browser');
            return;
        }

        setIsSharing(true);
        try {
            const blob = await pdf(<TranscriptDocument transcriptData={transcriptData} user={user} />).toBlob();
            const file = new File([blob], `Transcript_${user.studentId}.pdf`, {
                type: 'application/pdf',
                lastModified: Date.now()
            });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                // Hint for user
                toast('Opening share menu...\nIf WhatsApp is missing, please download the PDF and share manually.', {
                    icon: 'ℹ️',
                    duration: 5000,
                });

                await navigator.share({
                    files: [file]
                });
            } else {
                toast.error('File sharing not supported on this device/browser');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            if (error.name !== 'AbortError') {
                toast.error('Failed to share transcript');
            }
        } finally {
            setIsSharing(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '60px', textAlign: 'center' }}>Loading transcript...</div>;
    }

    if (!transcriptData) {
        return <div style={{ padding: '60px', textAlign: 'center' }}>Unable to load transcript data.</div>;
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="no-print" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Official Transcript
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Digital record of your academic achievements.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="btn"
                        style={{
                            gap: '8px',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            opacity: isSharing ? 0.7 : 1,
                            cursor: isSharing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSharing ? <Printer size={18} className="animate-spin" /> : <Share2 size={18} />}
                        {isSharing ? 'Sharing...' : 'Share PDF'}
                    </button>
                    <PDFDownloadLink
                        document={<TranscriptDocument transcriptData={transcriptData} user={user} />}
                        fileName={`Transcript_${user.studentId}.pdf`}
                        className="btn btn-primary"
                        style={{ textDecoration: 'none', gap: '8px' }}
                    >
                        {({ blob, url, loading, error }) => (
                            <>
                                {loading ? <Printer size={18} className="animate-spin" /> : <Download size={18} />}
                                {loading ? 'Generating PDF...' : 'Download PDF'}
                            </>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>

            {/* Transcript Paper */}
            <div
                className="card"
                style={{
                    padding: '60px',
                    borderRadius: '4px',
                    minHeight: '1123px', // A4 Approx Height
                    position: 'relative',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    background: 'var(--color-card-bg, white)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Watermark */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-30deg)',
                    fontSize: '120px',
                    fontWeight: 900,
                    color: 'rgba(0,0,0,0.02)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    OFFICIAL COPY
                </div>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <GraduationCap size={32} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                                Institute of Technology & Science
                            </h2>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                123 Academic Avenue, Knowledge City, State - 500001
                            </p>
                        </div>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '4px' }}>OFFICIAL TRANSCRIPT OF RECORDS</h3>
                </div>

                {/* Student Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                    <div>
                        <table style={{ width: '100%', fontSize: '14px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Student Name</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{user?.profile?.firstName} {user?.profile?.lastName}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Student ID</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{user?.studentId}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Date of Birth</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>12 Jan 2002</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table style={{ width: '100%', fontSize: '14px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Department</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{user?.profile?.department}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Program</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>Bachelor of Technology</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Issue Date</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{new Date(transcriptData.generatedAt).toLocaleDateString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Semester Records */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
                    {transcriptData.semesters.map((sem) => (
                        <div key={sem.semester} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>SEMESTER {sem.semester} ({sem.results[0]?.academicYear || 'N/A'})</span>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>SGPA: {sem.sgpa}</span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                        <th style={{ textAlign: 'left', padding: '8px', width: '15%' }}>Code</th>
                                        <th style={{ textAlign: 'left', padding: '8px', width: '50%' }}>Subject Title</th>
                                        <th style={{ textAlign: 'center', padding: '8px', width: '15%' }}>Credits</th>
                                        <th style={{ textAlign: 'center', padding: '8px', width: '20%' }}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sem.results.map((sub, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--color-surface)' }}>
                                            <td style={{ padding: '8px', fontWeight: 500 }}>{sub.subjectCode}</td>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{sub.subjectName}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{sub.credits}</td>
                                            <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{sub.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* Footer / Results Summary */}
                <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '2px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Grading System</h4>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', maxWidth: '300px', lineHeight: '1.5' }}>
                                CGPA is calculated on a scale of 10. Grade Points: O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Cumulative Grade Point Average (CGPA)</p>
                            <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'Outfit' }}>{transcriptData.cgpa}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '120px', height: '1px', backgroundColor: 'var(--color-text-primary)', marginBottom: '8px' }}></div>
                            <p style={{ fontSize: '12px', fontWeight: 600 }}>Controller of Examinations</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <ShieldCheck size={32} color="var(--color-primary)" style={{ opacity: 0.5 }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '120px', height: '1px', backgroundColor: 'var(--color-text-primary)', marginBottom: '8px' }}></div>
                            <p style={{ fontSize: '12px', fontWeight: 600 }}>Registrar</p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Transcript;
