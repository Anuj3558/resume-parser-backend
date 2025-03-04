const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Fetch all resumes
router.get('/', authMiddleware, resumeController.getAllResumes);

// Upload a new resume
router.post('/', authMiddleware, resumeController.uploadResume);

// Match resumes with job descriptions
router.get('/match/:jobId', authMiddleware, resumeController.matchResumes);

module.exports = router;
