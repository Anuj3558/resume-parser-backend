const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobTitle: { type: String, required: false }, // New field to associate resumes with jobs
  status: { type: String, enum: ["pending", "processed", "deleted"], default: "pending" },
  
  analysisResult: {
    result: { type: String, enum: ["pass", "fail", "pending"], default: "pending" },
    education: { type: String },
    gpa: { type: Number },
    summary: { type: String },
  },
});

module.exports = mongoose.model("Resume", ResumeSchema);
