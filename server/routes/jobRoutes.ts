import express, { Request, Response } from "express";

import { Job, JobCategory } from "../models";
const jobRouter = express.Router();

/** -----------------------
 * Job Category Endpoints
 * ------------------------
 */
jobRouter.get("/job-categories", async (req: Request, res: Response) => {
    try {
        const categories = await JobCategory.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Error fetching job categories" });
    }
});



// ✅ Create Job Category (Uses `name` Instead of `title`)
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

// ✅ Delete Job Category
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

// ✅ Get All Job Categories (Ensure `id`, `name`, `createdAt`)
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
 
jobRouter.get("/jobs", async (req: Request, res: Response) => {
    try {
      const jobs = await Job.find().populate("userId", "name email");
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Error fetching jobs" });
    }
});
// Create Job
jobRouter.post("/jobs", async (req: any, res:any) => {
  try {
    const { userId, title, description, skillReq, status } = req.body;

    if (!userId || !title || !description || !skillReq || !status)
      return res.status(400).json({ error: "All fields are required" });

    const job = new Job({ userId, title, description, skillReq, status });
    await job.save();

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: "Error creating job" });
  }
});

// Update Job
jobRouter.put("/jobs/:id", async (req: any, res:any) => {
  try {
    const { id } = req.params;
    const { title, description, skillReq, status } = req.body;

    const job = await Job.findByIdAndUpdate(
      id,
      { title, description, skillReq, status },
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Error updating job" });
  }
});

// Delete Job
jobRouter.delete("/jobs/:id", async (req: any, res:any) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting job" });
  }
});

export default jobRouter;
