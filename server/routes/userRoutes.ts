import dotenv from "dotenv"
dotenv.config()
import express, {Request, Response} from "express"
import {User} from "../models"
import {connectToDatabase} from "../utils/db"
import e from "express"
import {hash} from "bcryptjs"
const router = express.Router()

router.get("/getUsers", async (req: Request, res: Response) => {
	try {
		const users = await User.find()
		res.status(200).json(users)
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({message: error.message})
		} else {
			res.status(500).json({message: "An unknown error occurred"})
		}
	}
})

router.post("/addUser", async (req: any, res: any) => {
	try {
		const {name, email, status} = req.body
		console.log(req.body)
		let {password} = req.body
		const category = "USER"
		if (!name || !email || !status || !password) {
			return res.status(400).json({message: "Please fill all fields"})
		}
		password = await hash(password, 10)
		const user = new User({name, email, status, password, category})
		await user.save()
		res.status(201).json({message: "Users added successfully"})
	} catch (error) {}
})

// Update Job Category
router.put("/updateUser/:id", async (req: any, res: any) => {
	try {
		const {id} = req.params
		const {name, email, status} = req.body
		let password = req.body.password

		password = await hash(password, 10)

		if (!name || !email || !status || !password) {
			return res.status(400).json({message: "Please fill all fields"})
		}

		const updatedUser = await User.findByIdAndUpdate(id, {
			name,
			email,
			password,
			status,
		}).exec()

		if (!updatedUser) {
			return res.status(404).json({message: "User not found"})
		}

		res.status(200).json({message: "User updated successfully"})
	} catch (error) {
		console.error("Error updating user:", error)
		res.status(500).json({message: "Internal server error"})
	}
})

router.put("/updateUserStatus/:id", async (req: any, res: any) => {
	try {
		const {id} = req.params

		const user = await User.findById(id).exec()

		if (!user) {
			return res.status(404).json({message: "User not found"})
		} else {
			if (user.status === "ACTIVE") {
				user.status = "INACTIVE"
			} else {
				user.status = "ACTIVE"
			}
			await user.save()
			res.status(200).json({message: "User status updated successfully"})
		}
	} catch (error) {
		console.error("Error updating user:", error)
		res.status(500).json({message: "Internal server error"})
	}
})

// Delete Job Category
router.delete("/deleteUser/:id", async (req: any, res: any) => {
	try {
		const {id} = req.params
		await User.findByIdAndDelete(id)
		res.status(200).json({message: "User deleted successfully"})
	} catch (error) {}
})

export default router
