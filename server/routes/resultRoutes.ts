import mongoose, {Schema} from "mongoose"
import path from "path"
import fs from "fs"
import multer from "multer"
import express, {Request, Response, NextFunction} from "express"
import {extractTextFromPdf} from "../../pdf-extract"
import {invokeAnthropicForJob} from "../../anthropic"
import {Job, ResumeAnalysed} from "../models"

const Analyzerouter = express.Router()
const inputDir = path.join(__dirname, "../../input")

Analyzerouter.post(
	"/:jobId/:userId",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = req.params.userId
			const jobId = req.params.jobId

			// Check if jobId is a valid MongoDB ObjectId
			if (!mongoose.Types.ObjectId.isValid(jobId)) {
				res.status(400).json({message: "Invalid job ID."})
				return
			}

			// Convert jobId string to MongoDB ObjectId
			const jobObjectId = new mongoose.Types.ObjectId(jobId)

			// Find the job by its ObjectId
			const jobVal = await Job.findOne({_id: jobObjectId})
			if (!jobVal) {
				res.status(404).json({message: "Job not found."})
				return
			}

			const sanitizedJobTitle = jobVal.title
				.replace(/[^a-zA-Z0-9]/g, "_")
				.toLowerCase()
			// Construct the directory path
			const jobDir = path.join(inputDir, userId, sanitizedJobTitle)
			console.log(jobDir)

			// Check if the directory exists
			if (!fs.existsSync(jobDir)) {
				res.status(404).json({message: "Job directory not found."})
				return
			}

			// Read all resume files in the directory
			const resumeFiles = fs
				.readdirSync(jobDir)
				.filter((file) => file.endsWith(".pdf"))

			if (resumeFiles.length === 0) {
				res.status(400).json({message: "No resumes found in the directory."})
				return
			}

			// Fetch the job details from the database
			const job = await Job.findOne({_id: jobObjectId, initiator: userId})
			if (!job) {
				res.status(404).json({message: "Job not found."})
				return
			}

			// Process each resume
			for (const resumeFile of resumeFiles) {
				const resumePath = path.join(jobDir, resumeFile)

				// Extract text from the resume
				const resumeText = await extractTextFromPdf(resumePath)
				console.log(resumeText)
				// Send the text to Anthropic for evaluation
				const evaluation = await invokeAnthropicForJob(
					resumeText,
					job.description,
					job.requirements
				)
				console.log(evaluation)
				// Save the evaluation result in the ResumeAnalysed schema
				const resumeAnalysed = new ResumeAnalysed({
					resumeId: new mongoose.Types.ObjectId(), // Generate a new ID for the resume
					jobId: job._id,
					candidateName: evaluation.response.name || "Unknown",
					education: evaluation.response.college || "Unknown",
					skills: evaluation.response.skills || "Unknown",
					summary: evaluation.response.summary || "No summary available",
					result: evaluation.response.result || "Fail",
					timestamp: new Date(),
				})

				await resumeAnalysed.save()

				// Update the job's resumes array with the evaluation result
				job.resumes.push({
					name: resumeFile,
					filePath: resumePath,
					evaluation: evaluation.response,
				})

				await job.save()
			}

			res.status(200).json({
				message: "Resumes processed successfully.",
				jobId: job._id,
			})
		} catch (error) {
			console.error("Error processing resumes:", error)
			res.status(500).json({
				message: "Failed to process resumes.",
				error: (error as any).message,
			})
		}
	}
)
export default Analyzerouter
