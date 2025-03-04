const Resume = require('../models/Resume');

const getAllResumes = async () => {
    return await Resume.find().populate('userId', 'name email');
};

const getResumeById = async (resumeId) => {
    return await Resume.findById(resumeId).populate('userId', 'name email');
};

const createResume = async (resumeData) => {
    const resume = new Resume(resumeData);
    return await resume.save();
};

const updateResume = async (resumeId, resumeData) => {
    return await Resume.findByIdAndUpdate(resumeId, resumeData, { new: true });
};

const deleteResume = async (resumeId) => {
    return await Resume.findByIdAndDelete(resumeId);
};

module.exports = { getAllResumes, getResumeById, createResume, updateResume, deleteResume };
