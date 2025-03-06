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
const Adminrouter = express_1.default.Router();
Adminrouter.get('/admin/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Fetch total number of users
        const totalUsers = yield index_1.User.countDocuments();
        // Fetch active users
        const activeUsers = yield index_1.User.countDocuments({ status: 'ACTIVE' });
        // Fetch total job descriptions
        const totalJobs = yield index_1.Job.countDocuments();
        // Fetch total resume matches (assuming this is a sum of resumeMatches in all jobs)
        const totalResumeMatches = yield index_1.Job.aggregate([
            { $group: { _id: null, total: { $sum: "$resumeMatches" } } }
        ]);
        // Fetch job categories distribution
        const jobCategories = yield index_1.Job.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        // Fetch resume match distribution (example: grouping by percentage)
        const resumeMatchDistribution = yield index_1.Job.aggregate([
            {
                $bucket: {
                    groupBy: "$resumeMatches",
                    boundaries: [0, 50, 70, 90, 100],
                    default: "Other",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);
        // Fetch recent user activity (example: last 5 activities)
        const recentActivity = yield index_1.User.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .select('name email status');
        // Prepare the response
        const analyticsData = {
            totalUsers,
            activeUsers,
            totalJobs,
            totalResumeMatches: ((_a = totalResumeMatches[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            jobCategories,
            resumeMatchDistribution,
            recentActivity,
        };
        res.status(200).json(analyticsData);
    }
    catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = Adminrouter;
