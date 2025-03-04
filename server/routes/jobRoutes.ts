import express, { Request, Response } from "express";

import { Job, JobCategory } from "../models";
const router = express.Router();

/** -----------------------
 * Job Category Endpoints
 * ------------------------
 */

// Create Job Category
router.post("/job-categories", async (req: any, res:any) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const jobCategory = new JobCategory({ title });
    await jobCategory.save();

    res.status(201).json(jobCategory);
  } catch (error) {
    res.status(500).json({ error: "Error creating job category" });
  }
});

// Update Job Category
router.put("/job-categories/:id", async (req: any, res:any) => {
  try {
    const { title } = req.body;
    const { id } = req.params;

    const jobCategory = await JobCategory.findByIdAndUpdate(
      id,
      { title },
      { new: true, runValidators: true }
    );

    if (!jobCategory) return res.status(404).json({ error: "Job Category not found" });

    res.json(jobCategory);
  } catch (error) {
    res.status(500).json({ error: "Error updating job category" });
  }
});

// Delete Job Category
router.delete("/job-categories/:id", async (req: any, res:any) => {
  try {
    const { id } = req.params;
    const jobCategory = await JobCategory.findByIdAndDelete(id);

    if (!jobCategory) return res.status(404).json({ error: "Job Category not found" });

    res.json({ message: "Job Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting job category" });
  }
});

/** -----------------------
 * Job Endpoints
 * ------------------------
 */

// Create Job
router.post("/jobs", async (req: any, res:any) => {
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
router.put("/jobs/:id", async (req: any, res:any) => {
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
router.delete("/jobs/:id", async (req: any, res:any) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting job" });
  }
});

export default router;
