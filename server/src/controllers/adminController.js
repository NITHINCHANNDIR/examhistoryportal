const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const User = require('../models/User');
const ExamResult = require('../models/ExamResult');
const AgentLog = require('../models/AgentLog');
const AuditLog = require('../models/AuditLog');
const BatchInsight = require('../models/BatchInsight');

const DEPARTMENT_CODES = {
    "AGRICULTURAL ENGINEERING": "AGRI",
    "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE": "AI&DS",
    "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING": "AI&ML",
    "BIOMEDICAL ENGINEERING": "BME",
    "BIOTECHNOLOGY": "BT",
    "CHEMISTRY": "CHEM",
    "CIVIL ENGINEERING": "CIVIL",
    "COMPUTER SCIENCE AND BUSINESS SYSTEMS": "CSBS",
    "COMPUTER SCIENCE AND DESIGN": "CSD",
    "COMPUTER SCIENCE AND ENGINEERING": "CSE",
    "COMPUTER TECHNOLOGY": "CT",
    "ELECTRICAL AND ELECTRONICS ENGINEERING": "EEE",
    "ELECTRONICS AND COMMUNICATION ENGINEERING": "ECE",
    "ELECTRONICS AND INSTRUMENTATION ENGINEERING": "EIE",
    "FASHION TECHNOLOGY": "FT",
    "FOOD TECHNOLOGY": "FTCH",
    "HUMANITIES": "HUM",
    "INFORMATION SCIENCE AND ENGINEERING": "ISE",
    "INFORMATION TECHNOLOGY": "IT",
    "MATHEMATICS": "MATH",
    "MECHANICAL ENGINEERING": "MECH",
    "MECHATRONICS ENGINEERING": "MCT",
    "PHYSICAL EDUCATION": "PE",
    "PHYSICS": "PHY",
    "SCHOOL OF MANAGEMENT STUDIES": "SMS",
    "TEXTILE TECHNOLOGY": "TT"
};

// @desc    Upload bulk results (CSV/JSON)
// @route   POST /api/admin/upload
// @access  Private (Admin)
exports.uploadResults = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const uploadBatchId = `BATCH-${Date.now()}`;
        const results = [];
        const errors = [];

        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        if (fileExtension === '.json') {
            // Parse JSON file
            const jsonData = JSON.parse(fs.readFileSync(req.file.path, 'utf-8'));
            for (const record of jsonData) {
                try {
                    const processed = await processRecord(record, uploadBatchId, req.user._id);
                    results.push(processed);
                } catch (err) {
                    errors.push({ record, error: err.message });
                }
            }
        } else if (fileExtension === '.csv') {
            // Parse CSV file
            await new Promise((resolve, reject) => {
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', async (row) => {
                        try {
                            const processed = await processRecord(row, uploadBatchId, req.user._id);
                            results.push(processed);
                        } catch (err) {
                            errors.push({ record: row, error: err.message });
                        }
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid file format. Only CSV and JSON are supported.'
            });
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Create audit log
        await AuditLog.createEntry({
            action: 'results_uploaded',
            category: 'data',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            details: {
                description: `Uploaded ${results.length} results`,
                affectedRecords: results.length
            }
        });

        // Trigger agent for anomaly detection
        await AgentLog.create({
            taskType: 'anomaly_detection',
            status: 'pending',
            priority: 'high',
            triggeredBy: 'event',
            triggeredByUser: req.user._id,
            details: {
                inputData: { uploadBatchId, recordCount: results.length }
            }
        });

        res.status(200).json({
            success: true,
            message: `Uploaded ${results.length} results successfully`,
            data: {
                batchId: uploadBatchId,
                uploaded: results.length,
                errors: errors.length,
                errorDetails: errors
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading results',
            error: error.message
        });
    }
};

// Helper function to process each record
async function processRecord(record, uploadBatchId, uploadedBy) {
    // Find or validate student
    let student = await User.findOne({ studentId: record.studentId });

    if (!student) {
        throw new Error(`Student not found: ${record.studentId}`);
    }

    // Create exam result
    return await ExamResult.create({
        studentId: record.studentId,
        student: student._id,
        examId: record.examId,
        examName: record.examName,
        subjectCode: record.subjectCode,
        subjectName: record.subjectName,
        marks: {
            obtained: parseFloat(record.marksObtained),
            maximum: parseFloat(record.marksMaximum || 100)
        },
        grade: record.grade,
        credits: parseInt(record.credits || 3),
        semester: parseInt(record.semester),
        academicYear: record.academicYear,
        examDate: new Date(record.examDate),
        uploadBatchId,
        uploadedBy
    });
}

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
    try {
        // Get total students
        const totalStudents = await User.countDocuments({ role: 'student' });

        // Calculate average CGPA and highest CGPA across all students
        const students = await User.find({ role: 'student' }).select('studentId');
        let totalCGPA = 0;
        let studentsWithResults = 0;
        let highestCGPA = 0;

        for (const student of students) {
            const cgpa = await ExamResult.calculateCGPA(student.studentId);
            if (cgpa > 0) {
                totalCGPA += cgpa;
                studentsWithResults++;
                if (cgpa > highestCGPA) {
                    highestCGPA = cgpa;
                }
            }
        }

        const averageCGPA = studentsWithResults > 0 ? (totalCGPA / studentsWithResults).toFixed(2) : 0;

        // Get total results count
        const totalResults = await ExamResult.countDocuments({ isArchived: false });

        // Calculate pass rate (assuming grade 'F' is fail)
        const failedResults = await ExamResult.countDocuments({ grade: 'F', isArchived: false });
        const passRate = totalResults > 0 ? (((totalResults - failedResults) / totalResults) * 100).toFixed(1) : 100;

        // Get total unique subjects
        const uniqueSubjects = await ExamResult.distinct('subjectCode', { isArchived: false });
        const totalSubjects = uniqueSubjects.length;

        // Get active semesters
        const activeSemesters = await ExamResult.distinct('semester', { isArchived: false });
        const totalSemesters = activeSemesters.length;

        // Grade distribution for chart
        const gradeDistribution = await ExamResult.aggregate([
            { $match: { isArchived: false } },
            { $group: { _id: '$grade', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Semester-wise average performance
        const semesterPerformance = await ExamResult.aggregate([
            { $match: { isArchived: false } },
            {
                $group: {
                    _id: { semester: '$semester', academicYear: '$academicYear' },
                    avgMarks: { $avg: '$marks.obtained' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.academicYear': 1, '_id.semester': 1 } },
            { $limit: 8 }
        ]);

        // Subject-wise average performance (top 10 subjects)
        const subjectPerformance = await ExamResult.aggregate([
            { $match: { isArchived: false } },
            {
                $group: {
                    _id: '$subjectName',
                    avgMarks: { $avg: '$marks.obtained' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { avgMarks: -1 } },
            { $limit: 10 }
        ]);

        // CGPA distribution ranges
        const cgpaRanges = [
            { range: '9.0-10.0', min: 9.0, max: 10.0 },
            { range: '8.0-8.9', min: 8.0, max: 8.9 },
            { range: '7.0-7.9', min: 7.0, max: 7.9 },
            { range: '6.0-6.9', min: 6.0, max: 6.9 },
            { range: 'Below 6.0', min: 0, max: 5.9 }
        ];

        const cgpaDistribution = [];
        for (const range of cgpaRanges) {
            let count = 0;
            for (const student of students) {
                const cgpa = await ExamResult.calculateCGPA(student.studentId);
                if (cgpa >= range.min && cgpa <= range.max) {
                    count++;
                }
            }
            cgpaDistribution.push({ range: range.range, count });
        }

        // Department-wise student count
        const departmentStats = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$profile.department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                averageCGPA: parseFloat(averageCGPA),
                highestCGPA: parseFloat(highestCGPA.toFixed(2)),
                totalResults,
                passRate: parseFloat(passRate),
                totalSubjects,
                totalSemesters,
                studentsWithResults,
                gradeDistribution: gradeDistribution.map(g => ({ grade: g._id, count: g.count })),
                semesterPerformance: semesterPerformance.map(s => ({
                    semester: `Sem ${s._id.semester}`,
                    academicYear: s._id.academicYear,
                    avgMarks: parseFloat(s.avgMarks.toFixed(2)),
                    count: s.count
                })),
                subjectPerformance: subjectPerformance.map(s => ({
                    subject: s._id.length > 20 ? s._id.substring(0, 20) + '...' : s._id,
                    avgMarks: parseFloat(s.avgMarks.toFixed(2)),
                    count: s.count
                })),
                cgpaDistribution: cgpaDistribution,
                departmentStats: departmentStats.map(d => ({
                    department: DEPARTMENT_CODES[d._id] || d._id || 'N/A',
                    count: d.count
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
exports.getStudents = async (req, res) => {
    try {
        const { department, batchYear, search, page = 1, limit = 20 } = req.query;

        const query = { role: 'student' };

        if (department) query['profile.department'] = department;
        if (batchYear) query['profile.batchYear'] = parseInt(batchYear);
        if (search) {
            query.$text = { $search: search };
        }

        const total = await User.countDocuments(query);
        const students = await User.find(query)
            .select('-password')
            .sort({ 'profile.lastName': 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: students.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// @desc    Get student details with results
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
exports.getStudentDetails = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');

        if (!student || student.role !== 'student') {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const results = await ExamResult.find({ student: student._id })
            .sort({ semester: -1, examDate: -1 });

        const cgpa = await ExamResult.calculateCGPA(student.studentId);

        res.status(200).json({
            success: true,
            data: {
                student,
                cgpa,
                results,
                totalResults: results.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student details',
            error: error.message
        });
    }
};

// @desc    Get Agent logs
// @route   GET /api/admin/agent-logs
// @access  Private (Admin)
exports.getAgentLogs = async (req, res) => {
    try {
        const { taskType, status, startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = {};

        if (taskType) query.taskType = taskType;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const total = await AgentLog.countDocuments(query);
        const logs = await AgentLog.find(query)
            .populate('triggeredByUser', 'email profile.firstName profile.lastName')
            .populate('groundedBy', 'email profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching agent logs',
            error: error.message
        });
    }
};

// @desc    Get batch insights
// @route   GET /api/admin/insights
// @access  Private (Admin)
exports.getBatchInsights = async (req, res) => {
    try {
        const { academicYear, insightType, severity, page = 1, limit = 10 } = req.query;

        const query = {};

        if (academicYear) query['scope.academicYear'] = academicYear;
        if (insightType) query.insightType = insightType;
        if (severity) query.severity = severity;

        const total = await BatchInsight.countDocuments(query);
        const insights = await BatchInsight.find(query)
            .populate('acknowledgedBy', 'email profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: insights.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching insights',
            error: error.message
        });
    }
};

// @desc    Acknowledge insight
// @route   PUT /api/admin/insights/:id/acknowledge
// @access  Private (Admin)
exports.acknowledgeInsight = async (req, res) => {
    try {
        const insight = await BatchInsight.findByIdAndUpdate(
            req.params.id,
            {
                acknowledgedBy: req.user._id,
                acknowledgedAt: new Date()
            },
            { new: true }
        );

        if (!insight) {
            return res.status(404).json({
                success: false,
                message: 'Insight not found'
            });
        }

        res.status(200).json({
            success: true,
            data: insight
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error acknowledging insight',
            error: error.message
        });
    }
};
// @desc    Add new student result
// @route   POST /api/admin/results
// @access  Private (Admin)
exports.addStudentResult = async (req, res) => {
    try {
        const { studentId, examName, subjectCode, subjectName, marks, grade, credits, semester, academicYear, examDate } = req.body;

        const student = await User.findOne({ studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const result = await ExamResult.create({
            studentId,
            student: student._id,
            examId: `MANUAL-${Date.now()}`,
            examName,
            subjectCode,
            subjectName,
            marks: {
                obtained: marks.obtained,
                maximum: marks.maximum || 100
            },
            grade,
            credits: credits || 3,
            semester,
            academicYear,
            examDate: examDate || new Date(),
            anomalyFlags: [{
                type: 'manual_entry',
                description: 'Result manually created by admin',
                flaggedBy: 'admin',
                resolved: true
            }],
            uploadedBy: req.user._id
        });

        // Create audit log
        await AuditLog.createEntry({
            action: 'result_created',
            category: 'data',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            details: {
                resultId: result._id,
                studentId: studentId
            }
        });

        res.status(201).json({
            success: true,
            data: result,
            message: 'Result added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding result',
            error: error.message
        });
    }
};

// @desc    Update student result
// @route   PUT /api/admin/results/:id
// @access  Private (Admin)
exports.updateStudentResult = async (req, res) => {
    try {
        const { marks, grade, credits } = req.body;
        const result = await ExamResult.findById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            });
        }

        // Update fields if provided
        if (marks) {
            if (marks.obtained !== undefined) result.marks.obtained = marks.obtained;
            if (marks.maximum !== undefined) result.marks.maximum = marks.maximum;
        }
        if (grade) result.grade = grade;
        if (credits !== undefined) result.credits = credits;

        // Add audit trail for manual update
        result.anomalyFlags.push({
            type: 'manual_update',
            description: 'Result manually updated by admin',
            flaggedBy: 'admin',
            resolved: true
        });

        // The pre-save hook in ExamResult model will handle:
        // 1. Percentage calculation
        // 2. Grade points update
        // 3. Digital signature regeneration
        await result.save();

        // Create audit log
        await AuditLog.createEntry({
            action: 'result_updated',
            category: 'data',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            details: {
                resultId: result._id,
                studentId: result.studentId,
                updates: { marks, grade, credits }
            }
        });

        res.status(200).json({
            success: true,
            data: result,
            message: 'Result updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating result',
            error: error.message
        });
    }
};

// @desc    Delete student result
// @route   DELETE /api/admin/results/:id
// @access  Private (Admin)
exports.deleteStudentResult = async (req, res) => {
    try {
        const result = await ExamResult.findById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            });
        }

        // Store details for audit log before deletion
        const resultDetails = {
            resultId: result._id,
            studentId: result.studentId,
            examName: result.examName,
            subjectCode: result.subjectCode
        };

        await result.deleteOne();

        // Create audit log
        await AuditLog.createEntry({
            action: 'results_deleted',
            category: 'data',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            details: resultDetails
        });

        res.status(200).json({
            success: true,
            data: {},
            message: 'Result deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting result',
            error: error.message
        });
    }
};

// @desc    Add new student
// @route   POST /api/admin/students
// @access  Private (Admin)
exports.addStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, studentId, department, batchYear } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or Student ID already exists'
            });
        }

        // Generate temporary password (student ID + first name)
        const password = `${studentId}${firstName.toLowerCase()}`;

        // Create user
        const user = await User.create({
            email,
            password, // Password will be hashed by User model pre-save hook
            role: 'student',
            studentId,
            profile: {
                firstName,
                lastName,
                department,
                batchYear: parseInt(batchYear),
                avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
            },
            active: true
        });

        // Create audit log
        await AuditLog.createEntry({
            action: 'user_created',
            category: 'user',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            details: {
                targetUserId: user._id,
                targetUserEmail: user.email,
                role: 'student'
            }
        });

        res.status(201).json({
            success: true,
            data: user,
            message: 'Student created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);

        if (!student || student.role !== 'student') {
            return res.status(404).json({
                success: false,
                message: 'Student not found or not authorized to delete this user type'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        await AuditLog.createEntry({
            action: 'user_deleted',
            category: 'user',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            targetUser: student._id,
            details: {
                description: `Deleted student: ${student.email}`
            },
            severity: 'critical'
        });

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
};
