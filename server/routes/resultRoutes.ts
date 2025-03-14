import mongoose, { Schema } from "mongoose";
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import express, { Request, Response, NextFunction } from 'express';
import { extractTextFromPdf } from "../../pdf-extract";
import { invokeAnthropicForJob } from "../../anthropic";
import { Job, Resume, ResumeAnalysed } from "../models";

const Analyzerouter = express.Router();
const inputDir = path.join(__dirname, '../../input');


Analyzerouter.post('/:jobId/:userId', async (req: any, res: any): Promise<void> => {
    try {
        const { jobId, userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
          return res.status(400).json({ error: 'Invalid job ID format.' });
        }
    
        const job = await Job.findById(jobId);
        if (!job) {
          return res.status(404).json({ error: 'Job not found.' });
        }
    
        const resumes = await Resume.find({ job: jobId, user: userId, processed: 'N' });
        if (resumes.length === 0) {
          return res.status(400).json({ error: 'No unprocessed resumes found.' });
        }
    
        const analysisResults = [];
    
        for (const resume of resumes) {
            console.log("Processing - ", resume.filePath)
          const resumePath = path.join(inputDir, resume.filePath.replace('/input/', ''));
          const resumeText = await extractTextFromPdf(resumePath);
          const evaluation = await invokeAnthropicForJob(resumeText, job.description, job.requirements);
          console.log("Ai responded with ->", evaluation)
          const resumeAnalysis = new ResumeAnalysed({
            resumeId: resume._id,
            jobId: job._id,
            candidateName: evaluation.response.name || 'Unknown',
            matchingscore: evaluation?.response?.matchingscore || 0,
            summary: evaluation.response.summary || 'No summary available',
            result: evaluation.response.result || 'Fail',
            city: evaluation.response.city || 'Na',
            phone: evaluation.response.phone || 'Na',
            college: evaluation.response.college || 'Na',
            gender: evaluation.response.gender || 'Na',
            degree: evaluation.response.degree || 'Na',
            year: evaluation.response.year || 'Na',
            interest: evaluation.response.interest || 'Na',
            timestamp: new Date(),
          });
          await resumeAnalysis.save();
          await Resume.updateOne({ _id: resume._id }, { processed: 'Y' });
          job.resumes.push({
            name: resumePath,
            filePath: resumePath,
            evaluation: evaluation.response,
        });
        await job.save()
        //   await resume.save();
          analysisResults.push(resumeAnalysis);
        }
    
        const allProcessedResults = await ResumeAnalysed.find({ jobId }).populate('resumeId');
    
        res.status(200).json({ 
          message: 'Resumes processed successfully.',
          analysisResults: allProcessedResults 
        });
      } catch (error: any) {
        console.error('Error processing resumes:', error);
        res.status(500).json({ message: 'Failed to process resumes.', error: error.message });
      }
});



// Get all analyzed resumes
Analyzerouter.get("/getAllResumes", async (req: any, res: any) => {
    try {
        const resumes = await ResumeAnalysed.find().populate("resumeId").populate("jobId");
        res.status(200).json(resumes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

// Get analyzed resume by ID
Analyzerouter.get("/getResume/:id", async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const resume = await ResumeAnalysed.findById(id).populate("resumeId").populate("jobId");

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        res.status(200).json(resume);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});


export default Analyzerouter;
