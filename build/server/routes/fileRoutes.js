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
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../models/index"); // Adjust import path as needed
const router = (0, express_1.Router)();
const inputDir = path_1.default.join(__dirname, '../../input');
// Ensure the input directory exists
if (!fs_1.default.existsSync(inputDir)) {
    fs_1.default.mkdirSync(inputDir);
}
router.post('/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || !req.files.resume) {
            return res.status(400).json({ error: 'No resume files were uploaded.' });
        }
        const { jobId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: 'Invalid job ID format.' });
        }
        const userId = req.body.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        const job = yield index_1.Job.findById(jobId);
        const user = yield index_1.User.findById(userId);
        if (!job || !user) {
            return res.status(404).json({ error: 'Job or user not found.' });
        }
        const userDir = path_1.default.join(inputDir, userId.toString());
        if (!fs_1.default.existsSync(userDir))
            fs_1.default.mkdirSync(userDir);
        const sanitizedJobTitle = job.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const jobDir = path_1.default.join(userDir, sanitizedJobTitle);
        if (!fs_1.default.existsSync(jobDir))
            fs_1.default.mkdirSync(jobDir);
        const files = Array.isArray(req.files.resume) ? req.files.resume : [req.files.resume];
        const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const timestamp = new Date().getTime();
            const fileExtension = path_1.default.extname(file.name);
            const fileName = `${path_1.default.basename(file.name, fileExtension)}_${timestamp}${fileExtension}`;
            if (fileExtension.toLowerCase() !== '.pdf') {
                throw new Error(`File ${file.name} is not a PDF.`);
            }
            const filePath = path_1.default.join(jobDir, fileName);
            yield file.mv(filePath);
            const resumeRecord = new index_1.Resume({
                filePath: `/input/${userId}/${sanitizedJobTitle}/${fileName}`,
                processed: 'N',
                name: fileName,
                user: userId,
                job: jobId,
            });
            yield resumeRecord.save();
            return resumeRecord;
        }));
        const uploadedResumes = yield Promise.all(uploadPromises);
        res.json({
            success: true,
            message: `${uploadedResumes.length} resume(s) uploaded successfully`,
            resumes: uploadedResumes
        });
    }
    catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            error: 'Error uploading resume files.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get all resumes for a specific job
router.get('/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobId } = req.params;
        // Validate jobId
        if (!mongoose_1.default.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: 'Invalid job ID format.' });
        }
        const job = yield index_1.Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        res.json({
            success: true,
            resumes: job.resumes
        });
    }
    catch (error) {
        console.error('Fetch job resumes error:', error);
        res.status(500).json({ error: 'Error fetching job resumes.' });
    }
}));
// Delete a specific resume
router.delete('/delete-resume/:jobId/:resumeName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { jobId, resumeName } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        // Validate jobId
        if (!mongoose_1.default.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: 'Invalid job ID format.' });
        }
        const job = yield index_1.Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        // Find resume in the job's resumes array
        const resumeIndex = job.resumes.findIndex((resume) => resume.name === resumeName);
        if (resumeIndex === -1) {
            return res.status(404).json({ error: 'Resume not found.' });
        }
        const resumeToDelete = job.resumes[resumeIndex];
        // Remove the file
        const filePath = path_1.default.join(inputDir, resumeToDelete.filePath.replace('/input/', ''));
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Update the job document
        job.resumes.splice(resumeIndex, 1);
        job.resumeMatches -= 1;
        yield job.save();
        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({ error: 'Error deleting resume.' });
    }
}));
exports.default = router;
