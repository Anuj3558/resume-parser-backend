const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middlewares/authMiddleware');

// Fetch all job descriptions
router.get('/', authMiddleware, jobController.getAllJobs);

// Create a new job description
router.post('/', authMiddleware, jobController.createJob);

// Update a job description
router.put('/:id', authMiddleware, jobController.updateJob);

// Delete a job description
router.delete('/:id', authMiddleware, jobController.deleteJob);

module.exports = router;
