const express = require('express');
const router = express.Router();
const {
    getResults,
    getTrends,
    getTranscript,
    submitQuery,
    getQueryStatus
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require student authentication
router.use(protect);
router.use(authorize('student'));

router.get('/results', getResults);
router.get('/trends', getTrends);
router.get('/transcript', getTranscript);
router.post('/query', submitQuery);
router.get('/query/:id', getQueryStatus);

module.exports = router;
