const express = require('express');
const router = express.Router();
const {
    getAuditLogs,
    getUsers,
    updateUserRole,
    toggleUserStatus,
    groundAgentDecision,
    getConfig,
    updateConfig,
    getAgentStats,
    createAdmin,
    deleteUser
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require superadmin authentication
router.use(protect);
router.use(authorize('superadmin'));

// Audit logs
router.get('/audit-logs', getAuditLogs);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.post('/users/admin', createAdmin);
router.delete('/users/:id', deleteUser);

// Agent control
router.post('/agent/ground/:logId', groundAgentDecision);
router.get('/agent/stats', getAgentStats);

// System configuration
router.get('/config', getConfig);
router.put('/config', updateConfig);

module.exports = router;
