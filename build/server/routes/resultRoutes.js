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
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const pdf_extract_1 = require("../../pdf-extract");
const anthropic_1 = require("../../anthropic");
const models_1 = require("../models");
const Analyzerouter = express_1.default.Router();
const inputDir = path_1.default.join(__dirname, '../../input');
Analyzerouter.post('/:jobId/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const jobId = req.params.jobId;
        console.log("job id->", jobId);
        // Check if jobId is a valid MongoDB ObjectId
        // if (!mongoose.Types.ObjectId.isValid(jobId)) {
        //     res.status(400).json({ message: 'Invalid job ID.' });
        //     return;
        // }
        // Convert jobId string to MongoDB ObjectId
        const jobObjectId = new mongoose_1.default.Types.ObjectId(jobId);
        // Find the job by its ObjectId
        const jobVal = yield models_1.Job.findOne({ _id: jobObjectId });
        if (!jobVal) {
            res.status(404).json({ message: 'Job not found.' });
            return;
        }
        const sanitizedJobTitle = jobVal.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        // Construct the directory path
        const jobDir = path_1.default.join(inputDir, userId, sanitizedJobTitle);
        console.log(jobDir);
        // Check if the directory exists
        if (!fs_1.default.existsSync(jobDir)) {
            res.status(404).json({ message: 'Job directory not found.' });
            return;
        }
        // Read all resume files in the directory
        const resumeFiles = fs_1.default.readdirSync(jobDir).filter(file => file.endsWith('.pdf'));
        if (resumeFiles.length === 0) {
            res.status(400).json({ message: 'No resumes found in the directory.' });
            return;
        }
        // Fetch the job details from the database
        const job = yield models_1.Job.findOne({ _id: jobObjectId, initiator: userId });
        if (!job) {
            res.status(404).json({ message: 'Job not found.' });
            return;
        }
        // Process each resume
        for (const resumeFile of resumeFiles) {
            const resumePath = path_1.default.join(jobDir, resumeFile);
            // Extract text from the resume
            const resumeText = yield (0, pdf_extract_1.extractTextFromPdf)(resumePath);
            console.log(resumeText);
            // Send the text to Anthropic for evaluation
            const evaluation = yield (0, anthropic_1.invokeAnthropicForJob)(resumeText, job.description, job.requirements);
            console.log(evaluation);
            // Save the evaluation result in the ResumeAnalysed schema
            const resumeAnalysed = new models_1.ResumeAnalysed({
                resumeId: new mongoose_1.default.Types.ObjectId(), // Generate a new ID for the resume
                jobId: job._id,
                candidateName: evaluation.response.name || 'Unknown',
                education: evaluation.response.college || 'Unknown',
                skills: evaluation.response.skills || 'Unknown',
                summary: evaluation.response.summary || 'No summary available',
                result: evaluation.response.result || 'Fail',
                timestamp: new Date(),
            });
            yield resumeAnalysed.save();
            // Update the job's resumes array with the evaluation result
            job.resumes.push({
                name: resumeFile,
                filePath: resumePath,
                evaluation: evaluation.response,
            });
            yield job.save();
        }
        res.status(200).json({ message: 'Resumes processed successfully.', jobId: job._id });
    }
    catch (error) {
        console.error("Error processing resumes:", error);
        res.status(500).json({ message: 'Failed to process resumes.', error: error.message });
    }
}));
// Get all analyzed resumes
Analyzerouter.get("/getAllResumes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resumes = yield models_1.ResumeAnalysed.find().populate("resumeId").populate("jobId");
        res.status(200).json(resumes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
}));
// Get analyzed resume by ID
Analyzerouter.get("/getResume/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const resume = yield models_1.ResumeAnalysed.findById(id).populate("resumeId").populate("jobId");
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        res.status(200).json(resume);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
}));
exports.default = Analyzerouter;
