const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    jobTitle: { type: String, required: true }, // Stores the job position
    candidateName: { type: String, required: true },
    education: { type: String },
    gpa: { type: Number },
    summary: { type: String },
    result: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
    processedAt: { type: Date }, // Stores when the resume was analyzed
    deleted: { type: Boolean, default: false } // Soft delete functionality
});

module.exports = mongoose.model('Resume', ResumeSchema);
