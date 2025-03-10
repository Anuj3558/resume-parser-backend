import mongoose, { Schema } from "mongoose";
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import express, { Request, Response, NextFunction } from 'express';

const Filerouter = express.Router();

// Define the directory for storing uploaded files
const inputDir = path.join(__dirname, '..', '..', 'input');

// Function to ensure directory exists
const ensureDirExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Multer configuration for file storage
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        const userId = req.params.userId;
        const jobTitle = req.params.jobTitle;
        const uploadDir = path.join(inputDir, userId, jobTitle);
        ensureDirExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, file.originalname); // Use original name
    }
});

const upload = multer({ storage: storage });

/**
 * @route   POST /resumes/upload/:userId/:jobTitle
 * @desc    Upload resumes for a specific user and job title
 * @access  Private
 */
Filerouter.post('/upload/:userId/:jobTitle', upload.array('resumes'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            res.status(400).json({ message: 'No files uploaded.' });
            return;
        }

        const userId = req.params.userId;
        const jobTitle = req.params.jobTitle;

        // Map the files array to include file paths
        const files = Array.from(req.files as unknown as Express.Multer.File[]).map(file => ({
            name: file.originalname,
            filePath: path.join(inputDir, userId, jobTitle, file.originalname)
        }));

        res.status(200).json({ message: 'Files uploaded successfully.', files: files });
    } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ message: 'File upload failed.', error: error });
    }
});

export default Filerouter;
