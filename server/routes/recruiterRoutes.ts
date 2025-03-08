import dotenv from "dotenv"
dotenv.config()
import express, {Request, Response} from "express"
import {User} from "../models"
import {Job} from "../models"
import {connectToDatabase} from "../utils/db"
import e from "express"
import {hash} from "bcryptjs"
const router = express.Router()

router.get("/getAssignedJobs/:id", async (req: Request, res: Response) => {
	try {
		console.log("getJobs")
		const {id} = req.params
		const jobs = await Job.find({assigned: {$in: [id]}, initiator: id})
		console.log(jobs)
		res.status(200).json(jobs)
	} catch (error) {
		res.status(500).json({message: "Server error", error})
	}
})
router.get("/getAllJobs/:id", async (req: Request, res: Response) => {
	try {
		console.log("getJobs")
		const {id} = req.params
		const jobs = await Job.find({initiator: id})
		console.log(jobs)
		res.status(200).json(jobs)
	} catch (error) {
		res.status(500).json({message: "Server error", error})
	}
})

export default router
