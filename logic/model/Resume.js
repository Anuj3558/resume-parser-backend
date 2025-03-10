const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    jobTitle: { type: String, required: true }, // New field for job-based filtering
    analysisResults: {
        candidateName: String,
        result: String,
        education: String,
        gpa: Number,
        summary: String
    },
    isDeleted: { type: Boolean, default: false } // New field for soft delete
});

module.exports = mongoose.model('Resume', ResumeSchema);
