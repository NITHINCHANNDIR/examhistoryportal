const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'user_login',
            'user_logout',
            'user_created',
            'user_updated',
            'user_deleted',
            'role_changed',
            'results_uploaded',
            'results_modified',
            'results_deleted',
            'result_created',
            'result_updated',
            'agent_grounded',
            'agent_resumed',
            'config_updated',
            'system_access',
            'export_data',
            'bulk_operation',
            'onboarding_completed'
        ],
        index: true
    },
    category: {
        type: String,
        enum: ['auth', 'user', 'data', 'agent', 'system'],
        required: true,
        index: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    performedByRole: {
        type: String,
        enum: ['student', 'admin', 'superadmin'],
        required: true
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetResource: {
        type: { type: String },
        id: { type: String }
    },
    details: {
        previousValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        description: String,
        affectedRecords: Number
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        sessionId: String
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false
});

// Compound indexes for efficient audit queries
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, severity: 1, createdAt: -1 });

// Static method to create audit entry
auditLogSchema.statics.createEntry = async function (data) {
    return await this.create({
        action: data.action,
        category: data.category,
        performedBy: data.performedBy,
        performedByRole: data.performedByRole,
        targetUser: data.targetUser,
        targetResource: data.targetResource,
        details: data.details,
        metadata: data.metadata,
        severity: data.severity || 'info'
    });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
