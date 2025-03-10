const express = require('express');
const Resume = require('../models/Resume');
const router = express.Router();

// Upload a resume
router.post('/upload', async (req, res) => {
    try {
        const { fileName, jobTitle, analysisResults } = req.body;
        const newResume = new Resume({ fileName, jobTitle, analysisResults });
        await newResume.save();
        res.status(201).json({ message: 'Resume uploaded successfully', resume: newResume });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all resumes (excluding soft-deleted ones)
router.get('/', async (req, res) => {
    try {
        const resumes = await Resume.find({ isDeleted: false });
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Soft delete a resume
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Resume.findByIdAndUpdate(id, { isDeleted: true });
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resumes by job title (for analytics dropdown)
router.get('/by-job/:jobTitle', async (req, res) => {
    try {
        const { jobTitle } = req.params;
        const resumes = await Resume.find({ jobTitle, isDeleted: false });
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
