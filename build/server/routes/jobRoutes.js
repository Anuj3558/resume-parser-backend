"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const models_1 = require("../models");
const mongoose_1 = __importStar(require("mongoose"));
const jobRouter = express_1.default.Router();
/** -----------------------
 * Job Category Endpoints
 * ------------------------
 */
//
jobRouter.post("/job-categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ error: "Name is required" });
        const jobCategory = new models_1.JobCategory({ name });
        yield jobCategory.save();
        console.log(jobCategory);
        res.status(201).json({
            id: jobCategory._id,
            name: jobCategory.name,
            createdAt: jobCategory.createdAt,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error creating job category" });
    }
}));
jobRouter.put("/job-categories/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const jobCategory = yield models_1.JobCategory.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
        if (!jobCategory)
            return res.status(404).json({ error: "Job Category not found" });
        res.json({
            id: jobCategory._id,
            name: jobCategory.name,
            createdAt: jobCategory.createdAt,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error updating job category" });
    }
}));
//
jobRouter.delete("/job-categories/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const jobCategory = yield models_1.JobCategory.findByIdAndDelete(id);
        if (!jobCategory)
            return res.status(404).json({ error: "Job Category not found" });
        res.json({ message: "Job Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting job category" });
    }
}));
//
jobRouter.get("/job-categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobCategories = yield models_1.JobCategory.find().sort({ createdAt: -1 });
        res.json(jobCategories.map((cat) => ({
            id: cat._id,
            name: cat.name,
            createdAt: cat.createdAt,
        })));
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching job categories" });
    }
}));
/** -----------------------
 * Job Endpoints
 * ------------------------
 */
//
jobRouter.get("/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const jobs = await Job.find().populate("userId", "name email");
        const jobs = yield models_1.Job.find().populate("assigned", "name email");
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching jobs" });
    }
}));
jobRouter.get("/resumeEvals/:jobId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.params.jobId;
        if (!mongoose_1.default.Types.ObjectId.isValid(jobId)) {
            return res.status(404).json({ response: [], error: "Invalid job ID" });
        }
        const job = yield models_1.Job.findById(jobId).select("resumes");
        if (!job) {
            return res.status(404).json({ response: [], error: "Job not found" });
        }
        // Use a Set to filter out duplicates (based on name + result)
        const seen = new Set();
        const uniqueResumes = job.resumes.filter((resume) => {
            var _a;
            const result = ((_a = resume.evaluation) === null || _a === void 0 ? void 0 : _a.result) || "UNKNOWN"; // Handle missing result
            const key = `${resume.name}-${result}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        res.json({ response: uniqueResumes });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching jobs" });
    }
}));
//
jobRouter.post("/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hiii");
    try {
        const { initiator, title, category, description, requirements, location, } = req.body;
        // console.log(
        // 	"Hiii",
        // 	initiator,
        // 	title,
        // 	category,
        // 	description,
        // 	requirements,
        // 	location
        // )
        console.log(initiator[1]);
        if (!title ||
            !category ||
            !description ||
            !requirements ||
            !location ||
            !initiator[1]) {
            return res.status(400).json({ error: "Please fill all fields" });
        }
        else {
            console.log("Received", title, initiator);
            const job = new models_1.Job({
                title,
                category,
                description,
                requirements,
                location,
                initiator: initiator,
            });
            yield job.save();
            console.log("Received", job);
            res.status(201).json(job);
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error creating job" });
    }
}));
//
jobRouter.put("/jobs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "Invalid Job ID" });
        const { title, category, description, requirements, location, status, resumeMatches, } = req.body;
        const job = yield models_1.Job.findByIdAndUpdate(id, {
            title,
            category,
            description,
            requirements,
            location,
            status,
            resumeMatches,
        }, { new: true, runValidators: true });
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating job" });
    }
}));
//
jobRouter.delete("/jobs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "Invalid Job ID" });
        const job = yield models_1.Job.findByIdAndDelete(id);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        res.json({ message: "Job deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting job" });
    }
}));
// ------
// JOb assignement
// -------
jobRouter.put("/assign/:jobId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const job = yield models_1.Job.findById(req.params.jobId);
        if (!job)
            return res.status(404).json({ message: "Job not found" });
        console.log(userId);
        if (!job.assigned.includes(userId)) {
            job.assigned.push(userId);
        }
        yield job.save();
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
jobRouter.get("/assigned/:jobId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield models_1.Job.findById(req.params.jobId).populate("assigned", "name email"); // Fetch recruiters
        if (!job)
            return res.status(404).json({ message: "Job not found" });
        res.json(job.assigned); // Return assigned recruiters
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
jobRouter.get("/job-categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Hello");
        const categories = yield models_1.JobCategory.find();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching job categories" });
    }
}));
jobRouter.delete("/jobs/unassign/:jobId/:recruiterId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId, recruiterId } = req.params;
    try {
        const updatedJob = yield models_1.Job.findByIdAndUpdate(jobId, { $pull: { assigned: recruiterId } }, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json({ message: "Recruiter unassigned", job: updatedJob });
    }
    catch (error) {
        console.error("Error unassigning recruiter:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
exports.default = jobRouter;
