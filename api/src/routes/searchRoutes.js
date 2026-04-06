const express = require('express');
const router = express.Router();
const { search, getSuggestions } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', search);
router.get('/suggestions', getSuggestions);

module.exports = router;
