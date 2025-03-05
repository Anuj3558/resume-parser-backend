import express, { Request, Response } from "express";

import { Job, JobCategory } from "../models";
import { Types } from "mongoose";
const jobRouter = express.Router();

/** -----------------------
 * Job Category Endpoints
 * ------------------------
 */
jobRouter.get("/job-categories", async (req: any, res: any) => {
    try {
        console.log('Hello')
        const categories = await JobCategory.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Error fetching job categories" });
    }
});



// 
jobRouter.post("/job-categories", async (req:any, res:any) => {
  try {
    const { name } = req.body; 
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    const jobCategory = new JobCategory({ name });
    await jobCategory.save();
    console.log(jobCategory)
    res.status(201).json({
      id: jobCategory._id,
      name: jobCategory.name,
      createdAt: jobCategory.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Error creating job category" });
  }
});


jobRouter.put("/job-categories/:id", async (req:any, res:any) => {
  try {
    const { name } = req.body; 
    const { id } = req.params;

    const jobCategory = await JobCategory.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );
    if  (!jobCategory) return res.status(404).json({ error: "Job Category not found" });

    res.json({
      id: jobCategory._id,
      name: jobCategory.name,
      createdAt: jobCategory.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating job category" });
  }
});

// 
jobRouter.delete("/job-categories/:id", async (req:any, res:any) => {
  try {
    const { id } = req.params;
    const jobCategory = await JobCategory.findByIdAndDelete(id);

    if (!jobCategory) return res.status(404).json({ error: "Job Category not found" });

    res.json({ message: "Job Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting job category" });
  }
});

// 
jobRouter.get("/job-categories", async (req:any, res:any) => {
  try {
    const jobCategories = await JobCategory.find().sort({ createdAt: -1 });

    res.json(jobCategories.map(cat => ({
      id: cat._id,
      name: cat.name,
      createdAt: cat.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ error: "Error fetching job categories" });
  }
});


/** -----------------------
 * Job Endpoints
 * ------------------------
 */
 
// 
jobRouter.get("/jobs", async (req: any, res: any) => {
  try {
    // const jobs = await Job.find().populate("userId", "name email");
    const jobs = await Job.find()
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching jobs" });
  }
});

// 
jobRouter.post("/jobs", async (req: any, res: any) => {
  try {
    const { userId, title, category, description, requirements, location} = req.body;

    if ( !title || !category || !description || !requirements || !location )
      return res.status(400).json({ error: "All fields are required" });

    const job = new Job({  title, category, description, requirements, location});
    await job.save();

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: "Error creating job" });
  }
});

// 
jobRouter.put("/jobs/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid Job ID" });

    const { title, category, description, requirements, location, status, resumeMatches } = req.body;

    const job = await Job.findByIdAndUpdate(
      id,
      { title, category, description, requirements, location, status, resumeMatches },
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Error updating job" });
  }
});

// 
jobRouter.delete("/jobs/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid Job ID" });

    const job = await Job.findByIdAndDelete(id);

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting job" });
  }
});

export default jobRouter;
