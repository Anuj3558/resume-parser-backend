import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

export const connectToDatabase = async () => {
	try {
		if (mongoose.connection.readyState) return
		await mongoose.connect(process.env.MONGO_URL as string, {
			dbName: "resume",
		})
		const result = await mongoose.model('Resume').deleteMany({ processed: "N" });
		console.log("Connected to MongoDB")
	} catch (error) {
		throw new Error(`Error connecting to database: ${error}`)
	}
}
