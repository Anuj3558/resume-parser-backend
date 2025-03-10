import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { FileArray, UploadedFile } from 'express-fileupload';
import mongoose from 'mongoose';
import { Job, User } from '../models/index'; // Adjust import path as needed

const router = Router();
const inputDir = path.join(__dirname, '../../input');

// Ensure the input directory exists
if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir);
}

// Handle resume upload for a specific job and user
router.post('/:jobId', async (req: any, res: any) => {
  try {
    // Check if files were uploaded
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ error: 'No resume files were uploaded.' });
    }

    // Get job ID from params
    const { jobId } = req.params;
    console.log(jobId)
    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format.' });
    }

    // Get user ID from request (assuming user is authenticated)
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Fetch job and user information
    const job = await Job.findById(jobId);
    const user = await User.findById(userId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Create directory structure: input/userId/jobTitle/
    const userDir = path.join(inputDir, userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
    }

    // Sanitize job title for directory name (remove special chars and spaces)
    const sanitizedJobTitle = job.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const jobDir = path.join(userDir, sanitizedJobTitle);
    if (!fs.existsSync(jobDir)) {
      fs.mkdirSync(jobDir);
    }

    // Handle single or multiple resume files
    const files = Array.isArray(req.files.resume) ? req.files.resume : [req.files.resume];
    
    const uploadPromises = files.map(async (file: UploadedFile) => {
      // Generate unique filename to prevent overwriting
      const timestamp = new Date().getTime();
      const fileExtension = path.extname(file.name);
      const fileName = `${path.basename(file.name, fileExtension)}_${timestamp}${fileExtension}`;
      
      // Check if file is a PDF
      if (fileExtension.toLowerCase() !== '.pdf') {
        throw new Error(`File ${file.name} is not a PDF.`);
      }
      
      const filePath = path.join(jobDir, fileName);
      const relativePath = path.relative(inputDir, filePath);
      
      // Move file to destination
      await file.mv(filePath);
      
      // Return resume info
      return {
        name: fileName,
        filePath: `/input/${relativePath}`,
        evaluation: null // Evaluation will be added later
      };
    });

    // Wait for all files to be processed
    const uploadedResumes = await Promise.all(uploadPromises);

    // Update job with resume information
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { 
        $push: { 
          resumes: { $each: uploadedResumes } 
        },
        $inc: { resumeMatches: uploadedResumes.length }
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: `${uploadedResumes.length} resume(s) uploaded successfully`,
      job: updatedJob
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading resume files.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all resumes for a specific job
router.get('/:jobId', async (req: any, res: any) => {
  try {
    const { jobId } = req.params;
    
    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format.' });
    }
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    
    res.json({ 
      success: true,
      resumes: job.resumes 
    });
  } catch (error) {
    console.error('Fetch job resumes error:', error);
    res.status(500).json({ error: 'Error fetching job resumes.' });
  }
});

// Delete a specific resume
router.delete('/delete-resume/:jobId/:resumeName', async (req: any, res: any) => {
  try {
    const { jobId, resumeName } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format.' });
    }
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Find resume in the job's resumes array
    const resumeIndex: number = job.resumes.findIndex((resume: { name: string }) => resume.name === resumeName);
    
    if (resumeIndex === -1) {
      return res.status(404).json({ error: 'Resume not found.' });
    }
    
    const resumeToDelete = job.resumes[resumeIndex];
    
    // Remove the file
    const filePath = path.join(inputDir, resumeToDelete.filePath.replace('/input/', ''));
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Update the job document
    job.resumes.splice(resumeIndex, 1);
    job.resumeMatches -= 1;
    await job.save();
    
    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Error deleting resume.' });
  }
});

export default router;