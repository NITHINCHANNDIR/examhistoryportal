const mongoose = require('mongoose');

const batchInsightSchema = new mongoose.Schema({
    insightType: {
        type: String,
        required: true,
        enum: [
            'failure_rate_alert',
            'grade_distribution',
            'performance_trend',
            'subject_comparison',
            'batch_comparison',
            'anomaly_summary'
        ],
        index: true
    },
    scope: {
        academicYear: { type: String, required: true },
        semester: { type: Number },
        department: { type: String },
        subjectCode: { type: String },
        batchYear: { type: Number }
    },
    data: {
        summary: { type: String, required: true },
        statistics: mongoose.Schema.Types.Mixed,
        percentages: mongoose.Schema.Types.Mixed,
        trends: [mongoose.Schema.Types.Mixed],
        recommendations: [String]
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    isActionRequired: {
        type: Boolean,
        default: false
    },
    acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    acknowledgedAt: {
        type: Date
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgentLog'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for dashboard queries
batchInsightSchema.index({ 'scope.academicYear': 1, insightType: 1 });
batchInsightSchema.index({ isActionRequired: 1, severity: 1 });

module.exports = mongoose.model('BatchInsight', batchInsightSchema);
