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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.JobCategory = exports.Job = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const JobCategorySchema = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});
const JobSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    location: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    resumeMatches: { type: Number, default: 0 },
    status: { type: String, enum: ["OPEN", "CLOSED"], required: true, default: "OPEN" },
    assigned: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    // users: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
    resumes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "ResumeAnalysed" }],
});
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // New username field
    email: { type: String, required: true, unique: true },
    // password: { type: String, required: true }, // Ensure password is required
    category: { type: String, enum: ["ADMIN", "USER"] },
    timestamp: { type: Date, default: Date.now },
    resumes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Resume" }],
    jobs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Assignment" }],
    role: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], required: true },
});
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
const JobCategory = mongoose_1.default.model("JobCategory", JobCategorySchema);
exports.JobCategory = JobCategory;
const Job = mongoose_1.default.model("JobSchema", JobSchema);
exports.Job = Job;
