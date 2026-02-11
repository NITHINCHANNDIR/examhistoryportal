const mongoose = require('mongoose');
const crypto = require('crypto');

const examResultSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    examId: {
        type: String,
        required: true,
        index: true
    },
    examName: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true,
        index: true
    },
    subjectName: {
        type: String,
        required: true
    },
    marks: {
        obtained: { type: Number, required: true },
        maximum: { type: Number, required: true, default: 100 },
        percentage: { type: Number }
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'AB'],
        required: true
    },
    credits: {
        type: Number,
        default: 3
    },
    gradePoints: {
        type: Number
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    academicYear: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    resultDeclaredAt: {
        type: Date,
        default: Date.now
    },
    digitalSignature: {
        type: String,
        index: true
    },
    signatureVerified: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false,
        index: true
    },
    archivedAt: {
        type: Date
    },
    anomalyFlags: [{
        type: { type: String },
        description: { type: String },
        flaggedAt: { type: Date, default: Date.now },
        flaggedBy: { type: String, enum: ['agent', 'admin'] },
        resolved: { type: Boolean, default: false }
    }],
    uploadBatchId: {
        type: String,
        index: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate percentage before saving
examResultSchema.pre('save', function () {
    if (this.marks.obtained !== undefined && this.marks.maximum) {
        this.marks.percentage = (this.marks.obtained / this.marks.maximum) * 100;
    }

    // Calculate grade points
    const gradePointsMap = {
        'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0, 'AB': 0
    };
    this.gradePoints = gradePointsMap[this.grade] || 0;

    // Generate digital signature if not present
    if (!this.digitalSignature) {
        const signatureData = `${this.studentId}-${this.examId}-${this.subjectCode}-${this.marks.obtained}-${this.grade}`;
        this.digitalSignature = crypto.createHash('sha256').update(signatureData).digest('hex');
    }
});

// Compound indexes for efficient queries
examResultSchema.index({ studentId: 1, semester: 1, academicYear: 1 });
examResultSchema.index({ studentId: 1, subjectCode: 1 });
examResultSchema.index({ examDate: 1, isArchived: 1 });
examResultSchema.index({ uploadBatchId: 1, createdAt: 1 });

// Text index for search
examResultSchema.index({
    examName: 'text',
    subjectName: 'text',
    subjectCode: 'text'
});

// Static method to get student's CGPA
examResultSchema.statics.calculateCGPA = async function (studentId) {
    const results = await this.find({
        studentId,
        isArchived: false,
        grade: { $ne: 'AB' }
    });

    if (!results.length) return 0;

    let totalCredits = 0;
    let totalGradePoints = 0;

    results.forEach(result => {
        totalCredits += result.credits;
        totalGradePoints += result.gradePoints * result.credits;
    });

    return totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
};

module.exports = mongoose.model('ExamResult', examResultSchema);
