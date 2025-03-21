import express, {Request, Response} from "express"

import {Job, JobCategory} from "../models"
import mongoose, {Types} from "mongoose"
const jobRouter = express.Router()

/** -----------------------
 * Job Category Endpoints
 * ------------------------
 */

//
jobRouter.post("/job-categories", async (req: any, res: any) => {
	try {
		const {name} = req.body
		if (!name) return res.status(400).json({error: "Name is required"})

		const jobCategory = new JobCategory({name})
		await jobCategory.save()
		res.status(201).json({
			id: jobCategory._id,
			name: jobCategory.name,
			createdAt: jobCategory.createdAt,
		})
	} catch (error) {
		res.status(500).json({error: "Error creating job category"})
	}
})

jobRouter.put("/job-categories/:id", async (req: any, res: any) => {
	try {
		const {name} = req.body
		const {id} = req.params

		const jobCategory = await JobCategory.findByIdAndUpdate(
			id,
			{name},
			{new: true, runValidators: true}
		)
		if (!jobCategory) return res.status(404).json({error: "Job Category not found"})

		res.json({
			id: jobCategory._id,
			name: jobCategory.name,
			createdAt: jobCategory.createdAt,
		})
	} catch (error) {
		res.status(500).json({error: "Error updating job category"})
	}
})

//
jobRouter.delete("/job-categories/:id", async (req: any, res: any) => {
	try {
		const {id} = req.params
		const jobCategory = await JobCategory.findByIdAndDelete(id)

		if (!jobCategory) return res.status(404).json({error: "Job Category not found"})

		res.json({message: "Job Category deleted successfully"})
	} catch (error) {
		res.status(500).json({error: "Error deleting job category"})
	}
})

//
jobRouter.get("/job-categories", async (req: any, res: any) => {
	try {
		const jobCategories = await JobCategory.find().sort({createdAt: -1})

		res.json(
			jobCategories.map((cat) => ({
				id: cat._id,
				name: cat.name,
				createdAt: cat.createdAt,
			}))
		)
	} catch (error) {
		res.status(500).json({error: "Error fetching job categories"})
	}
})

/** -----------------------
 * Job Endpoints
 * ------------------------
 */

//
jobRouter.get("/jobs", async (req: any, res: any) => {
	try {
		// const jobs = await Job.find().populate("userId", "name email");
		const jobs = await Job.find().populate("assigned", "name email")
		res.json(jobs)
	} catch (error) {
		res.status(500).json({error: "Error fetching jobs"})
	}
})

jobRouter.get("/resumeEvals/:jobId", async (req: any, res: any) => {
	try {
		const jobId = req.params.jobId;
		if (!mongoose.Types.ObjectId.isValid(jobId)) {
			return res.status(404).json({ response: [], error: "Invalid job ID" });
		}

		const job = await Job.findById(jobId).select("resumes");
		if (!job) {
			return res.status(404).json({ response: [], error: "Job not found" });
		}

		// Use a Set to filter out duplicates (based on name + result)
		const seen = new Set();
		const uniqueResumes = job.resumes.filter((resume) => {
			const result = resume.evaluation?.result || "UNKNOWN"; // Handle missing result
			const key = `${resume.name}-${result}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		res.json({ response: uniqueResumes });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error fetching jobs" });
	}
});


//
jobRouter.post("/jobs", async (req: any, res: any) => {
	try {
		const {
			initiator,
			title,
			category,
			description,
			requirements,
			location,
		} = req.body

		// console.log(
		// 	"Hiii",
		// 	initiator,
		// 	title,
		// 	category,
		// 	description,
		// 	requirements,
		// 	location
		// )
	

		if (
			!title ||
			!category ||
			!description ||
			!requirements ||
			!location ||
			!initiator[1]
		) {
			return res.status(400).json({error: "Please fill all fields"})
		} else {
		
			const job = new Job({
				title,
				category,
				description,
				requirements,
				location,
				initiator: initiator,
			})
			await job.save()

			res.status(201).json(job)
		}
	} catch (error) {
		res.status(500).json({error: "Error creating job"})
	}
})

//
jobRouter.put("/jobs/:id", async (req: any, res: any) => {
	try {
		const {id} = req.params
		if (!Types.ObjectId.isValid(id))
			return res.status(400).json({error: "Invalid Job ID"})

		const {
			title,
			category,
			description,
			requirements,
			location,
			status,
			resumeMatches,
		} = req.body

		const job = await Job.findByIdAndUpdate(
			id,
			{
				title,
				category,
				description,
				requirements,
				location,
				status,
				resumeMatches,
			},
			{new: true, runValidators: true}
		)

		if (!job) return res.status(404).json({error: "Job not found"})

		res.json(job)
	} catch (error) {
		res.status(500).json({error: "Error updating job"})
	}
})

//
jobRouter.delete("/jobs/:id", async (req: any, res: any) => {
	try {
		const {id} = req.params
		if (!Types.ObjectId.isValid(id))
			return res.status(400).json({error: "Invalid Job ID"})

		const job = await Job.findByIdAndDelete(id)

		if (!job) return res.status(404).json({error: "Job not found"})

		res.json({message: "Job deleted successfully"})
	} catch (error) {
		res.status(500).json({error: "Error deleting job"})
	}
})

// ------
// JOb assignement
// -------

jobRouter.put("/assign/:jobId", async (req: any, res: any) => {
	try {
		const {userId} = req.body
		const job = await Job.findById(req.params.jobId)
		if (!job) return res.status(404).json({message: "Job not found"})
		if (!job.assigned.includes(userId)) {
			job.assigned.push(userId)
		}

		await job.save()
		res.json(job)
	} catch (error) {
		res.status(500).json({message: "Server error", error})
	}
})
jobRouter.get("/assigned/:jobId", async (req: any, res: any) => {
	try {
		const job = await Job.findById(req.params.jobId).populate(
			"assigned",
			"name email"
		) // Fetch recruiters
		if (!job) return res.status(404).json({message: "Job not found"})

		res.json(job.assigned) // Return assigned recruiters
	} catch (error) {
		res.status(500).json({message: "Server error", error})
	}
})
jobRouter.get("/job-categories", async (req: any, res: any) => {
	try {
		const categories = await JobCategory.find()
		res.json(categories)
	} catch (error) {
		res.status(500).json({error: "Error fetching job categories"})
	}
})

jobRouter.delete("/jobs/unassign/:jobId/:recruiterId", async (req: any, res: any) => {
	const {jobId, recruiterId} = req.params

	try {
		const updatedJob = await Job.findByIdAndUpdate(
			jobId,
			{$pull: {assigned: recruiterId}},
			{new: true}
		)

		if (!updatedJob) {
			return res.status(404).json({message: "Job not found"})
		}

		res.status(200).json({message: "Recruiter unassigned", job: updatedJob})
	} catch (error) {
		console.error("Error unassigning recruiter:", error)
		res.status(500).json({message: "Server error"})
	}
})

export default jobRouter
