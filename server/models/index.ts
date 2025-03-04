import mongoose, { Schema } from "mongoose";

const JobCategorySchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }

});

const JobSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillReq: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["OPEN", "CLOSED"], required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
    resumes: [{ type: Schema.Types.ObjectId, ref: "ResumeAnalysed" }],
});


const JobCategory = mongoose.model("JobCategory", JobCategorySchema);
const Job = mongoose.model("JobSchema", JobSchema)


export {Job, JobCategory}
