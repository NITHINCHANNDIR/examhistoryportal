import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed, otherwise use default
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica-Regular.ttf' },
        { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica-Bold.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        position: 'relative'
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '25%',
        transform: 'rotate(-45deg)',
        fontSize: 100,
        color: 'rgba(0,0,0,0.03)',
        fontWeight: 'bold',
        zIndex: -1
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#4f46e5', // Primary color
        paddingBottom: 20,
        alignItems: 'center'
    },
    universityName: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#4f46e5',
        marginBottom: 5
    },
    universityAddress: {
        fontSize: 10,
        color: '#64748b'
    },
    title: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold',
        textDecoration: 'underline'
    },
    studentInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30
    },
    studentInfoCol: {
        width: '45%'
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 5,
        fontSize: 10
    },
    infoLabel: {
        width: 80,
        color: '#64748b',
        fontWeight: 'bold'
    },
    infoValue: {
        flex: 1,
        fontWeight: 'bold'
    },
    semesterContainer: {
        marginBottom: 15,
        breakInside: 'avoid'
    },
    semesterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 5,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    semesterTitle: {
        fontSize: 11,
        fontWeight: 'bold'
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 2,
        marginBottom: 2
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 2,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f1f5f9'
    },
    colCode: { width: '15%', fontSize: 9 },
    colName: { width: '50%', fontSize: 9 },
    colCredits: { width: '15%', fontSize: 9, textAlign: 'center' },
    colGrade: { width: '20%', fontSize: 9, textAlign: 'center', fontWeight: 'bold' },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 2,
        borderTopColor: '#4f46e5',
        paddingTop: 20
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    gradingSystem: {
        fontSize: 8,
        color: '#64748b',
        width: '60%',
        lineHeight: 1.4
    },
    cgpaContainer: {
        alignItems: 'flex-end'
    },
    cgpaLabel: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold'
    },
    cgpaValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4f46e5'
    },
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        paddingHorizontal: 20
    },
    signatureBlock: {
        alignItems: 'center'
    },
    signatureLine: {
        width: 100,
        height: 1,
        backgroundColor: '#000',
        marginBottom: 5
    },
    signatureText: {
        fontSize: 9,
        fontWeight: 'bold'
    }
});

const TranscriptDocument = ({ transcriptData, user }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Watermark */}
            <Text style={styles.watermark}>OFFICIAL COPY</Text>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.universityName}>Institute of Technology & Science</Text>
                <Text style={styles.universityAddress}>123 Academic Avenue, Knowledge City, State - 500001</Text>
                <Text style={styles.title}>OFFICIAL TRANSCRIPT OF RECORDS</Text>
            </View>

            {/* Student Info */}
            <View style={styles.studentInfoContainer}>
                <View style={styles.studentInfoCol}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Student Name</Text>
                        <Text style={styles.infoValue}>{user?.profile?.firstName} {user?.profile?.lastName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Student ID</Text>
                        <Text style={styles.infoValue}>{user?.studentId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>12 Jan 2002</Text>
                    </View>
                </View>
                <View style={styles.studentInfoCol}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Department</Text>
                        <Text style={styles.infoValue}>{user?.profile?.department}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Program</Text>
                        <Text style={styles.infoValue}>Bachelor of Technology</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Issue Date</Text>
                        <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>

            {/* Semesters */}
            {transcriptData.semesters.map((sem, index) => (
                <View key={index} style={styles.semesterContainer} wrap={false}>
                    <View style={styles.semesterHeader}>
                        <Text style={styles.semesterTitle}>SEMESTER {sem.semester} ({sem.results[0]?.academicYear || 'N/A'})</Text>
                        <Text style={styles.semesterTitle}>SGPA: {sem.sgpa}</Text>
                    </View>

                    <View style={styles.tableHeader}>
                        <Text style={styles.colCode}>Code</Text>
                        <Text style={styles.colName}>Subject Title</Text>
                        <Text style={styles.colCredits}>Credits</Text>
                        <Text style={styles.colGrade}>Grade</Text>
                    </View>

                    {sem.results.map((sub, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.colCode}>{sub.subjectCode}</Text>
                            <Text style={styles.colName}>{sub.subjectName}</Text>
                            <Text style={styles.colCredits}>{sub.credits}</Text>
                            <Text style={styles.colGrade}>{sub.grade}</Text>
                        </View>
                    ))}
                </View>
            ))}

            {/* Footer */}
            <View style={styles.footer} wrap={false}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.gradingSystem}>
                        CGPA is calculated on a scale of 10. Grade Points: O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0.
                    </Text>
                    <View style={styles.cgpaContainer}>
                        <Text style={styles.cgpaLabel}>Cumulative Grade Point Average (CGPA)</Text>
                        <Text style={styles.cgpaValue}>{transcriptData.cgpa}</Text>
                    </View>
                </View>

                <View style={styles.signatures}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Controller of Examinations</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Registrar</Text>
                    </View>
                </View>
            </View>
        </Page>
    </Document>
);

export default TranscriptDocument;
