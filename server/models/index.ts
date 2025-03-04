import mongoose, {Schema} from "mongoose"

const JobCategorySchema = new mongoose.Schema({
	id: {type: mongoose.Schema.Types.ObjectId, auto: true}, // Auto-generated unique ID
	title: {type: String, required: true, unique: true}, // Job category title
})

const JobSchema = new Schema({
	userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
	title: {type: String, required: true},
	description: {type: String, required: true},
	skillReq: {type: String, required: true},
	timestamp: {type: Date, default: Date.now},
	status: {type: String, enum: ["OPEN", "CLOSED"], required: true},
	users: [{type: Schema.Types.ObjectId, ref: "Assignment"}],
	resumes: [{type: Schema.Types.ObjectId, ref: "ResumeAnalysed"}],
})

const userSchema = new Schema({
	name: {type: String, required: true},

	email: {type: String, required: true, unique: true},

	password: {type: String},

	category: {type: String, Enum: ["ADMIN", "USER"]},

	timestamp: {type: Date, default: Date.now},

	resumes: [{type: Schema.Types.ObjectId, ref: "Resume"}],

	jobs: [{type: Schema.Types.ObjectId, ref: "Assignment"}],

	role: {type: String, required: true},

	status: {type: String, Enum: ["ACTIVE", "INACTIVE"], required: true},
})

const User = mongoose.model("User", userSchema)
const JobCategory = mongoose.model("JobCategory", JobCategorySchema)
const Job = mongoose.model("JobSchema", JobSchema)

export {Job, JobCategory, User}
