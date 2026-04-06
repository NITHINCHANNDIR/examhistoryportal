const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
    taskType: {
        type: String,
        required: true,
        enum: [
            'anomaly_detection',
            'batch_insights',
            'integrity_verification',
            'auto_archival',
            'student_query',
            'system_health'
        ],
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed', 'grounded'],
        default: 'pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    details: {
        inputData: mongoose.Schema.Types.Mixed,
        outputData: mongoose.Schema.Types.Mixed,
        processingSteps: [String],
        affectedRecords: [String],
        insights: [String],
        errorMessage: String,
        stackTrace: String
    },
    metrics: {
        startTime: Date,
        endTime: Date,
        duration: Number,
        recordsProcessed: { type: Number, default: 0 },
        anomaliesFound: { type: Number, default: 0 }
    },
    triggeredBy: {
        type: String,
        enum: ['scheduled', 'manual', 'event', 'student_query'],
        default: 'scheduled'
    },
    triggeredByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    groundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    groundedAt: {
        type: Date
    },
    groundingReason: {
        type: String
    },
    relatedLogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgentLog'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for recent logs query
agentLogSchema.index({ createdAt: -1, taskType: 1 });
agentLogSchema.index({ status: 1, createdAt: -1 });

// Static method to get agent statistics
agentLogSchema.statics.getStats = async function (startDate, endDate) {
    const match = {};
    if (startDate && endDate) {
        match.createdAt = { $gte: startDate, $lte: endDate };
    }

    return await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$taskType',
                total: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                grounded: { $sum: { $cond: [{ $eq: ['$status', 'grounded'] }, 1, 0] } },
                avgDuration: { $avg: '$metrics.duration' },
                totalAnomalies: { $sum: '$metrics.anomaliesFound' }
            }
        }
    ]);
};

module.exports = mongoose.model('AgentLog', agentLogSchema);
