import express, {Request, Response} from "express"
import fileUpload from "express-fileupload"
import path from "path"
import cors from "cors"
import fileRoutes from "./routes/fileRoutes"
import userRoutes from "./routes/userRoutes"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

import authRoutes from "./auth/authRoutes"
import jobRouter from "./routes/jobRoutes"
import {connectToDatabase} from "./utils/db"
import recruiterRoutes from "./routes/recruiterRoutes"
import Filerouter from "./routes/resultRoutes"
import Analyzerouter from "./routes/resultRoutes"
import AnalyticsRouter from "./routes/AnalyticsRoute"

const app = express()
const PORT = 4000

export const inputDir = path.join(__dirname, "input")
export const outputDir = path.join(__dirname, "output")

connectToDatabase()


app.use(
	cors({
	  origin: "*",
	})
  );
  //sfdhhh
// Middleware
app.use(express.static("views"))
app.use("/input", express.static(inputDir))
app.use("/output", express.static(outputDir))
app.use(fileUpload())
app.use(express.json())

app.use(express.urlencoded({extended: true}))


// Route
app.use("/auth", authRoutes)
app.use("/api", AnalyticsRouter)
// Protected routes
app.use("/resumes", Filerouter)
app.use("/upload-resume", fileRoutes)
app.use("/job", jobRouter)
app.use("/user", userRoutes)
app.use("/process-resumes", Analyzerouter)
app.use("/recruiter", recruiterRoutes)

app.get("/", (req: Request, res: Response) => {
	//res.sendFile(path.join(__dirname, "views", "index.html"))
	res.json({message: "Hellow world"})
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

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
