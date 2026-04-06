const User = require('../models/User');
const ExamResult = require('../models/ExamResult');

// @desc    Global search
// @route   GET /api/search
// @access  Private
exports.search = async (req, res) => {
    try {
        const { q, type, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const results = {
            students: [],
            exams: []
        };

        // Search based on user role
        const canSearchStudents = ['admin', 'superadmin'].includes(req.user.role);

        if (!type || type === 'students') {
            if (canSearchStudents) {
                // Search students
                const studentQuery = {
                    role: 'student',
                    $or: [
                        { email: { $regex: q, $options: 'i' } },
                        { studentId: { $regex: q, $options: 'i' } },
                        { 'profile.firstName': { $regex: q, $options: 'i' } },
                        { 'profile.lastName': { $regex: q, $options: 'i' } }
                    ]
                };

                results.students = await User.find(studentQuery)
                    .select('email studentId profile role')
                    .limit(parseInt(limit));
            }
        }

        if (!type || type === 'exams') {
            // Search exam results
            const examQuery = {
                $or: [
                    { examName: { $regex: q, $options: 'i' } },
                    { subjectCode: { $regex: q, $options: 'i' } },
                    { subjectName: { $regex: q, $options: 'i' } },
                    { examId: { $regex: q, $options: 'i' } }
                ]
            };

            // Students can only search their own results
            if (req.user.role === 'student') {
                examQuery.student = req.user._id;
            }

            results.exams = await ExamResult.find(examQuery)
                .select('examId examName subjectCode subjectName semester academicYear grade')
                .populate('student', 'studentId profile')
                .limit(parseInt(limit));
        }

        const totalResults = results.students.length + results.exams.length;

        res.status(200).json({
            success: true,
            query: q,
            totalResults,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
};

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Private
exports.getSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 1) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const suggestions = [];

        // Get unique subject names matching query
        const subjects = await ExamResult.distinct('subjectName', {
            subjectName: { $regex: q, $options: 'i' }
        });
        suggestions.push(...subjects.slice(0, 5).map(s => ({ type: 'subject', value: s })));

        // For admins, add student suggestions
        if (['admin', 'superadmin'].includes(req.user.role)) {
            const students = await User.find({
                role: 'student',
                $or: [
                    { studentId: { $regex: q, $options: 'i' } },
                    { 'profile.firstName': { $regex: q, $options: 'i' } }
                ]
            })
                .select('studentId profile.firstName profile.lastName')
                .limit(5);

            suggestions.push(...students.map(s => ({
                type: 'student',
                value: `${s.profile.firstName} ${s.profile.lastName} (${s.studentId})`
            })));
        }

        res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching suggestions',
            error: error.message
        });
    }
};
