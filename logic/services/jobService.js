const Job = require('../models/Job');

const getAllJobs = async () => {
    return await Job.find().populate('userId', 'name email');
};

const getJobById = async (jobId) => {
    return await Job.findById(jobId).populate('userId', 'name email');
};

const createJob = async (jobData) => {
    const job = new Job(jobData);
    return await job.save();
};

const updateJob = async (jobId, jobData) => {
    return await Job.findByIdAndUpdate(jobId, jobData, { new: true });
};

const deleteJob = async (jobId) => {
    return await Job.findByIdAndDelete(jobId);
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob };
