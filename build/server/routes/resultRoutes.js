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
const express_1 = __importDefault(require("express"));
const pdf_extract_1 = require("../../pdf-extract");
const anthropic_1 = require("../../anthropic");
const models_1 = require("../models");
const Analyzerouter = express_1.default.Router();
const inputDir = path_1.default.join(__dirname, "../../input");
Analyzerouter.post('/:jobId/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { jobId, userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: 'Invalid job ID format.' });
        }
        const job = yield models_1.Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        const resumes = yield models_1.Resume.find({ job: jobId, user: userId, processed: 'N' });
        if (resumes.length === 0) {
            return res.status(400).json({ error: 'No unprocessed resumes found.' });
        }
        const analysisResults = [];
        for (const resume of resumes) {
            console.log("Processing - ", resume.filePath);
            const resumePath = path_1.default.join(inputDir, resume.filePath.replace('/input/', ''));
            const resumeText = yield (0, pdf_extract_1.extractTextFromPdf)(resumePath);
            const evaluation = yield (0, anthropic_1.invokeAnthropicForJob)(resumeText, job.description, job.requirements);
            console.log("Ai responded with ->", evaluation);
            const resumeAnalysis = new models_1.ResumeAnalysed({
                resumeId: resume._id,
                jobId: job._id,
                candidateName: evaluation.response.name || 'Unknown',
                matchingscore: ((_a = evaluation === null || evaluation === void 0 ? void 0 : evaluation.response) === null || _a === void 0 ? void 0 : _a.matchingscore) || 0,
                summary: evaluation.response.summary || 'No summary available',
                result: evaluation.response.result || 'Fail',
                city: evaluation.response.city || 'Na',
                phone: evaluation.response.phone || 'Na',
                college: evaluation.response.college || 'Na',
                gender: evaluation.response.gender || 'Na',
                degree: evaluation.response.degree || 'Na',
                year: evaluation.response.year || 'Na',
                interest: evaluation.response.interest || 'Na',
                timestamp: new Date(),
            });
            yield resumeAnalysis.save();
            yield models_1.Resume.updateOne({ _id: resume._id }, { processed: 'Y' });
            job.resumes.push({
                name: resumePath,
                filePath: resumePath,
                evaluation: evaluation.response,
            });
            yield job.save();
            //   await resume.save();
            analysisResults.push(resumeAnalysis);
        }
        const allProcessedResults = yield models_1.ResumeAnalysed.find({ jobId }).populate('resumeId');
        res.status(200).json({
            message: 'Resumes processed successfully.',
            analysisResults: allProcessedResults
        });
    }
    catch (error) {
        console.error('Error processing resumes:', error);
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
