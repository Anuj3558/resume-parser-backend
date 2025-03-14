import express, {Request, Response} from "express"
import mongoose from "mongoose"
import {Job, JobCategory, ResumeAnalysed, User} from "../models/index" // Adjust the import path as necessary

const AnalyticsRouter = express.Router()

AnalyticsRouter.get("/admin/analytics", async (req: Request, res: Response) => {
	try {
		// Fetch total number of users
		const totalUsers = await User.countDocuments()

		// Fetch active users
		const activeUsers = await User.countDocuments({status: "ACTIVE"})

		// Fetch total job descriptions
		const totalJobs = await Job.countDocuments()

		// Fetch total resume matches (assuming this is a sum of resumeMatches in all jobs)
		const totalResumeMatches = await Job.aggregate([
			{$group: {_id: null, total: {$sum: "$resumeMatches"}}},
		])

		// Fetch job categories distribution
		const jobCategories = await Job.aggregate([
			{$group: {_id: "$category", count: {$sum: 1}}},
		])

		// Fetch resume match distribution (example: grouping by percentage)
		const resumeMatchDistribution = await Job.aggregate([
			{
				$bucket: {
					groupBy: "$resumeMatches",
					boundaries: [0, 50, 70, 90, 100],
					default: "Other",
					output: {
						count: {$sum: 1},
					},
				},
			},
		])

		// Fetch recent user activity (example: last 5 activities)
		const recentActivity = await User.find()
			.sort({timestamp: -1})
			.limit(5)
			.select("name email status")

		// Prepare the response
		const analyticsData = {
			totalUsers,
			activeUsers,
			totalJobs,
			totalResumeMatches: totalResumeMatches[0]?.total || 0,
			jobCategories,
			resumeMatchDistribution,
			recentActivity,
		}

		res.status(200).json(analyticsData)
	} catch (error) {
		console.error("Error fetching analytics data:", error)
		res.status(500).json({message: "Internal server error"})
	}
})

AnalyticsRouter.get("/user/analytics/:id", async (req: Request, res: Response) => {
	try {
		const jobCategories = await JobCategory.find({})

		const {id} = req.params
		console.log("id " + id)
		console.log("id " + "67d4200dcd6088d305d74b1a")
		const allEvals = await Job.find({
			$or: [{assigned: {$in: [id]}}, {initiator: id}],
		})

		let c = 0

		allEvals.map((job) => {
			c += job.resumeMatches
		})

		console.log("gg" + allEvals)

		const jobs = allEvals.map((job) => ({
			title: job.title,
			totalResumes: job.resumes.length,
			resumeMatches: job.resumeMatches,
		}))

		console.log(jobs)

		const analyticsData = {
			categories: jobCategories.length,
			descriptions: allEvals.length,
			candidates: allEvals.reduce((acc, job) => acc + job.resumes.length, 0),
			shortListed: c,
			rejected: allEvals.reduce((acc, job) => acc + job.resumes.length, 0) - c,
			jobs,
		}

		res.status(200).json(analyticsData)
	} catch (error) {
		console.error("Error fetching analytics data:", error)
		res.status(500).json({message: "Internal server error"})
	}
})

export default AnalyticsRouter
