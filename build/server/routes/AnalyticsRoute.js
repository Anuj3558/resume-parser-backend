"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../models/index"); // Adjust the import path as necessary
const AnalyticsRouter = express_1.default.Router();
AnalyticsRouter.get("/admin/analytics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch total number of users
        const totalUsers = yield index_1.User.countDocuments();
        // Fetch active users
        const activeUsers = yield index_1.User.countDocuments({ status: "ACTIVE" });
        // Fetch total job descriptions
        const totalJobs = yield index_1.Job.countDocuments();
        // Fetch total resumes processed
        const totalResumes = yield index_1.ResumeAnalysed.countDocuments();
        // Fetch total resume matches using ResumeAnalysed collection
        const successfulMatches = yield index_1.ResumeAnalysed.countDocuments({ result: "success" });
        // Fetch job categories distribution
        const jobCategories = yield index_1.Job.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);
        // Fetch result distribution (success vs fail)
        const resultDistribution = yield index_1.ResumeAnalysed.aggregate([
            {
                $group: {
                    _id: "$result", // Group by result (success or fail)
                    count: { $sum: 1 }
                }
            }
        ]);
        // Fetch recent user activity (example: last 5 activities)
        const recentActivity = yield index_1.User.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .select("name email status");
        // Prepare the response
        const analyticsData = {
            totalUsers,
            activeUsers,
            totalJobs,
            totalResumes,
            successfulMatches,
            rejectedMatches: totalResumes - successfulMatches,
            jobCategories,
            resultDistribution,
            recentActivity,
        };
        res.status(200).json(analyticsData);
    }
    catch (error) {
        console.error("Error fetching analytics data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
AnalyticsRouter.get("/user/analytics/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobCategories = yield index_1.JobCategory.find({});
        const { id } = req.params;
        const allEvals = yield index_1.Job.find({
            $or: [{ assigned: { $in: [id] } }, { initiator: id }],
        });
        let totalShortlisted = 0;
        // Fetch all job IDs for this user
        const jobIds = allEvals.map(job => job._id);
        // Get all ResumeAnalysed documents where result is 'success'
        const shortlistedResumes = yield index_1.ResumeAnalysed.find({
            jobId: { $in: jobIds },
            result: 'success' // Changed from 'sucess' to 'success' assuming it's a typo
        });
        // Count of shortlisted resumes
        totalShortlisted = shortlistedResumes.length;
        const jobs = allEvals.map((job) => __awaiter(void 0, void 0, void 0, function* () {
            // Get shortlisted resumes for this specific job
            const jobShortlisted = yield index_1.ResumeAnalysed.find({
                jobId: job._id,
                result: 'Success'
            }).countDocuments();
            return {
                title: job.title,
                totalResumes: job.resumes.length,
                resumeMatches: jobShortlisted, // Update this with actual count
            };
        }));
        // Wait for all job data to be processed
        const resolvedJobs = yield Promise.all(jobs);
        const totalCandidates = allEvals.reduce((acc, job) => acc + job.resumes.length, 0);
        const analyticsData = {
            categories: jobCategories.length,
            descriptions: allEvals.length,
            candidates: totalCandidates,
            shortListed: totalShortlisted,
            rejected: totalCandidates - totalShortlisted,
            jobs: resolvedJobs,
        };
        res.status(200).json(analyticsData);
    }
    catch (error) {
        console.error("Error fetching analytics data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = AnalyticsRouter;
