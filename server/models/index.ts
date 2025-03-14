import mongoose, { Schema } from "mongoose";
import path from 'path';
import fs from 'fs';
import { invokeAnthropicForJob } from '../../anthropic';
import { extractTextFromPdf } from '../../pdf-extract';
const inputDir = path.join(__dirname, '..', '..', 'input');

const JobCategorySchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

const JobSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    location: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    resumeMatches: { type: Number, default: 0 },
    status: { type: String, enum: ["OPEN", "CLOSED"], required: true, default: "OPEN" },
    assigned: [{ type: Schema.Types.ObjectId, ref: "User" }],
    initiator: { type: Schema.Types.ObjectId, ref: "User" },
    resumes: [
        {
            name: { type: String, required: true }, // Name of the resume file
            filePath: { type: String, required: true }, // Path to the resume file in the input directory
            evaluation: { type: Object }, // Evaluation result from Anthropic
        },
    ],
});

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, Enum: ["ADMIN", "USER"] },
    timestamp: { type: Date, default: Date.now },
    resumes: [{ type: Schema.Types.ObjectId, ref: "Resume" }],
    jobs: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
    role: { type: String },
    status: { type: String, Enum: ["ACTIVE", "INACTIVE"], required: true },
});

const resumeAnalysedSchema = new Schema({
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateName: { type: String, required: true },
    summary: { type: String, required: true },
    result: { type: String, required: true },
    matchingscore: { type: Number, required: true },
    college: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      year: {
        type: String,
        required: true,
      },
      interest: {
        type: [String],
        required: true,
      },
    timestamp: { type: Date, default: Date.now }
});


const resumeSchema = new Schema({
    filePath: { type: String, required: true },
    processed: {type: String, Enum: ["Y", "N"], required: true },
    name: { type: String },
    
    timestamp: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    job: { type: Schema.Types.ObjectId, ref: "Job" },
    analysis: [{ type: Schema.Types.ObjectId, ref: "ResumeAnalysed" }],
})

const User = mongoose.model("User", userSchema);
const JobCategory = mongoose.model("JobCategory", JobCategorySchema);
const Job = mongoose.model("Job", JobSchema); // Corrected model name
const ResumeAnalysed = mongoose.model('ResumeAnalysed', resumeAnalysedSchema);
const Resume = mongoose.model("Resume", resumeSchema)

export { Job, JobCategory, User, ResumeAnalysed, Resume };
