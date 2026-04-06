const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    uploadResults,
    getStudents,
    getStudentDetails,
    updateStudentResult,
    addStudentResult,   
    deleteStudentResult,
    addStudent,
    getAgentLogs,
    getBatchInsights,
    acknowledgeInsight,
    getStats,
    deleteStudent,
    updateStudent
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.csv', '.json']; 
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only CSV and JSON are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/stats', getStats);
router.post('/upload', upload.single('file'), uploadResults);
router.get('/students', getStudents);
router.post('/students', addStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/:id', getStudentDetails);
router.put('/results/:id', updateStudentResult);
router.post('/results', addStudentResult);
router.delete('/results/:id', deleteStudentResult);
router.get('/agent-logs', getAgentLogs);
router.get('/insights', getBatchInsights);
router.put('/insights/:id/acknowledge', acknowledgeInsight);


module.exports = router;
