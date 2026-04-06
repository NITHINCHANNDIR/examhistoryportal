const ExamResult = require('../models/ExamResult');
const AgentLog = require('../models/AgentLog');

// @desc    Get student's exam results
// @route   GET /api/student/results
// @access  Private (Student)
exports.getResults = async (req, res) => {
    try {
        const { semester, academicYear, subjectCode, page = 1, limit = 20 } = req.query;

        const query = {
            student: req.user._id,
            isArchived: false
        };

        if (semester) query.semester = parseInt(semester);
        if (academicYear) query.academicYear = academicYear;
        if (subjectCode) query.subjectCode = subjectCode;

        const total = await ExamResult.countDocuments(query);
        const results = await ExamResult.find(query)
            .sort({ examDate: -1, semester: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: results.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching results',
            error: error.message
        });
    }
};

// @desc    Get performance trends
// @route   GET /api/student/trends
// @access  Private (Student)
exports.getTrends = async (req, res) => {
    try {
        const results = await ExamResult.find({
            student: req.user._id,
            isArchived: false
        }).sort({ semester: 1, examDate: 1 });

        // Calculate semester-wise SGPA
        const semesterStats = {};
        results.forEach(result => {
            const key = `Sem ${result.semester}`;
            if (!semesterStats[key]) {
                semesterStats[key] = { credits: 0, gradePoints: 0, subjects: 0 };
            }
            semesterStats[key].credits += result.credits;
            semesterStats[key].gradePoints += result.gradePoints * result.credits;
            semesterStats[key].subjects += 1;
        });

        const trendData = Object.entries(semesterStats).map(([semester, stats]) => ({
            semester,
            sgpa: stats.credits > 0 ? (stats.gradePoints / stats.credits).toFixed(2) : 0,
            subjects: stats.subjects
        }));

        // Subject-wise performance
        const subjectStats = {};
        results.forEach(result => {
            if (!subjectStats[result.subjectCode]) {
                subjectStats[result.subjectCode] = {
                    name: result.subjectName,
                    marks: [],
                    grades: []
                };
            }
            subjectStats[result.subjectCode].marks.push(result.marks.percentage);
            subjectStats[result.subjectCode].grades.push(result.grade);
        });

        // Calculate CGPA
        const cgpa = await ExamResult.calculateCGPA(req.user.studentId);

        res.status(200).json({
            success: true,
            data: {
                cgpa,
                semesterTrends: trendData,
                subjectPerformance: Object.entries(subjectStats).map(([code, stats]) => ({
                    code,
                    name: stats.name,
                    avgMarks: (stats.marks.reduce((a, b) => a + b, 0) / stats.marks.length).toFixed(2),
                    latestGrade: stats.grades[stats.grades.length - 1]
                })),
                totalSubjects: Object.keys(subjectStats).length,
                totalResults: results.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trends',
            error: error.message
        });
    }
};

// @desc    Get transcript data
// @route   GET /api/student/transcript
// @access  Private (Student)
exports.getTranscript = async (req, res) => {
    try {
        const results = await ExamResult.find({
            student: req.user._id,
            isArchived: false
        }).sort({ semester: 1, subjectCode: 1 });

        const cgpa = await ExamResult.calculateCGPA(req.user.studentId);

        // Group by semester
        const semesters = {};
        results.forEach(result => {
            if (!semesters[result.semester]) {
                semesters[result.semester] = {
                    results: [],
                    totalCredits: 0,
                    totalGradePoints: 0
                };
            }
            semesters[result.semester].results.push(result);
            semesters[result.semester].totalCredits += result.credits;
            semesters[result.semester].totalGradePoints += result.gradePoints * result.credits;
        });

        const transcriptData = Object.entries(semesters).map(([sem, data]) => ({
            semester: parseInt(sem),
            results: data.results,
            sgpa: data.totalCredits > 0 ? (data.totalGradePoints / data.totalCredits).toFixed(2) : 0,
            totalCredits: data.totalCredits
        }));

        res.status(200).json({
            success: true,
            data: {
                student: {
                    id: req.user.studentId,
                    name: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
                    department: req.user.profile.department,
                    batchYear: req.user.profile.batchYear
                },
                cgpa,
                semesters: transcriptData,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating transcript',
            error: error.message
        });
    }
};

// @desc    Submit query to Antigravity Agent
// @route   POST /api/student/query
// @access  Private (Student)
exports.submitQuery = async (req, res) => {
    try {
        const { queryType, subjectCode, examId, description } = req.body;

        // Create agent log for the query
        const agentLog = await AgentLog.create({
            taskType: 'student_query',
            status: 'pending',
            priority: 'medium',
            triggeredBy: 'student_query',
            triggeredByUser: req.user._id,
            details: {
                inputData: {
                    studentId: req.user.studentId,
                    queryType,
                    subjectCode,
                    examId,
                    description
                }
            }
        });

        // In a real implementation, this would trigger the Agent worker
        // For now, we'll return the log ID for tracking

        res.status(201).json({
            success: true,
            message: 'Query submitted to Antigravity Agent for processing',
            data: {
                queryId: agentLog._id,
                status: agentLog.status,
                estimatedTime: '24-48 hours'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting query',
            error: error.message
        });
    }
};

// @desc    Get query status
// @route   GET /api/student/query/:id
// @access  Private (Student)
exports.getQueryStatus = async (req, res) => {
    try {
        const agentLog = await AgentLog.findOne({
            _id: req.params.id,
            triggeredByUser: req.user._id
        });

        if (!agentLog) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                queryId: agentLog._id,
                status: agentLog.status,
                createdAt: agentLog.createdAt,
                details: agentLog.details.outputData || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching query status',
            error: error.message
        });
    }
};
