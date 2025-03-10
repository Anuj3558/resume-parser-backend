const Resume = require('../models/Resume');

// Upload Resumes
exports.uploadResume = async (req, res) => {
    try {
        const { jobTitle, candidateName, education, gpa } = req.body;
        const filePath = req.file.path;

        const resume = new Resume({
            fileName: req.file.originalname,
            filePath,
            jobTitle,
            candidateName,
            education,
            gpa,
            result: 'Pending'
        });

        await resume.save();
        res.status(201).json({ message: 'Resume uploaded successfully', resume });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading resume', error });
    }
};

// Get all resumes (excluding deleted ones)
exports.getResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ deleted: false }).sort({ uploadedAt: -1 });
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resumes', error });
    }
};

// Soft Delete Resume
exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        await Resume.findByIdAndUpdate(id, { deleted: true });
        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting resume', error });
    }
};

// Get Analytics based on Job Title
exports.getAnalytics = async (req, res) => {
    try {
        const analytics = await Resume.aggregate([
            { $match: { deleted: false } },
            { $group: { 
                _id: "$jobTitle", 
                total: { $sum: 1 },
                passed: { $sum: { $cond: [{ $eq: ["$result", "Pass"] }, 1, 0] } },
                failed: { $sum: { $cond: [{ $eq: ["$result", "Fail"] }, 1, 0] } },
            }}
        ]);

        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error });
    }
};
