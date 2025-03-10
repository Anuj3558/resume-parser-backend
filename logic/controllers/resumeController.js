const Resume = require('../models/Resume');

exports.getResumes = async (req, res) => {
    try {
        const { jobTitle } = req.query;
        let query = { isDeleted: false }; 

        if (jobTitle) {
            query.jobTitle = jobTitle;
        }

        const resumes = await Resume.find(query);
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching resumes', details: error.message });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        const { fileName, uploadDate, jobTitle, analysisResults } = req.body;

        const newResume = new Resume({
            fileName,
            uploadDate,
            jobTitle,
            analysisResults,
            isDeleted: false
        });

        await newResume.save();
        res.status(201).json({ message: 'Resume uploaded successfully', resume: newResume });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading resume', details: error.message });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        resume.isDeleted = true;
        await resume.save();

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting resume', details: error.message });
    }
};
