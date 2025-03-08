import express, {Request, Response} from "express"
import fileUpload from "express-fileupload"
import path from "path"
import cors from "cors"
import fileRoutes from "./routes/fileRoutes"
import resultRoutes from "./routes/resultRoutes"
import userRoutes from "./routes/userRoutes"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

import authRoutes from "./auth/authRoutes"
import jobRouter from "./routes/jobRoutes"
import {connectToDatabase} from "./utils/db"
import Adminrouter from "./routes/AdminAnalyticsRoute"
import recruiterRoutes from "./routes/recruiterRoutes"

const app = express()
const PORT = 4000

export const inputDir = path.join(__dirname, "input")
export const outputDir = path.join(__dirname, "output")

connectToDatabase()

// Middleware
app.use(express.static("views"))
app.use("/input", express.static(inputDir))
app.use("/output", express.static(outputDir))
app.use(fileUpload())
app.use(express.json())

app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(
	cors({
		origin: ["https://resume-parser-lovat-two.vercel.app", "http://localhost:3000"],
		methods: ["GET", "POST", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
)

// Routes
app.use("/auth", authRoutes)
app.use("/api", Adminrouter)
// Protected routes
app.use("/files", fileRoutes)
app.use("/results", resultRoutes)
app.use("/job", jobRouter)
app.use("/user", userRoutes)
app.use("/recruiter", recruiterRoutes)

app.get("/", (req: Request, res: Response) => {
	//res.sendFile(path.join(__dirname, "views", "index.html"))
})

app.post("/config/update", (req: any, res: any) => {
	const {inputDir, outputDir} = req.body

	// Validate inputs (optional)
	if (!inputDir && !outputDir) {
		return res.status(400).send("No directories provided.")
	}

	const envFilePath = path.join(__dirname, "../.env")
	let envConfig = fs.readFileSync(envFilePath, "utf-8")

	if (inputDir) {
		envConfig = envConfig.replace(/INPUT_DIR=.*/, `INPUT_DIR=${inputDir}`)
	}
	if (outputDir) {
		envConfig = envConfig.replace(/OUTPUT_DIR=.*/, `OUTPUT_DIR=${outputDir}`)
	}

	// Update .env file
	fs.writeFileSync(envFilePath, envConfig)

	res.send(`<div class="text-green-400">Directories updated successfully!</div>`)
})

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
