import mongoose, {Schema} from "mongoose"

const JobCategorySchema = new mongoose.Schema({
	id: {type: mongoose.Schema.Types.ObjectId, auto: true}, // Auto-generated unique ID
	name: {type: String, required: true, unique: true},
	createdAt: {type: Date, default: Date.now},
})

const JobSchema = new Schema({
	title: {type: String, required: true},
	category: {type: String, required: true},
	description: {type: String, required: true},
	requirements: {type: String, required: true},
	location: {type: String, required: true},
	createdAt: {type: Date, default: Date.now},
	resumeMatches: {type: Number, default: 0},
	status: {type: String, enum: ["OPEN", "CLOSED"], required: true, default: "OPEN"},
	assigned: [{type: Schema.Types.ObjectId, ref: "User"}],
	// users: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
	initiator: {type: Schema.Types.ObjectId, ref: "User"},
	resumes: [{type: Schema.Types.ObjectId, ref: "ResumeAnalysed"}],
})

const userSchema = new Schema({
	name: {type: String, required: true},

	email: {type: String, required: true, unique: true},

	password: {type: String, required: true},

	category: {type: String, Enum: ["ADMIN", "USER"]},

	timestamp: {type: Date, default: Date.now},

	resumes: [{type: Schema.Types.ObjectId, ref: "Resume"}],

	jobs: [{type: Schema.Types.ObjectId, ref: "Assignment"}],

	role: {type: String},

	status: {type: String, Enum: ["ACTIVE", "INACTIVE"], required: true},
})

const User = mongoose.model("User", userSchema)
const JobCategory = mongoose.model("JobCategory", JobCategorySchema)
const Job = mongoose.model("JobSchema", JobSchema)

export {Job, JobCategory, User}
