import { Router, Request, Response } from 'express';
import { processResumes } from '../../index';
import path from 'path';
import fs from 'fs';
import { invokeAnthropicForJob } from '../../anthropic';
import PdfParse from 'pdf-parse';
import { extractTextFromPdf } from '../../pdf-extract';

const router = Router();

router.get('/process-resumes', async (req: any, res: any) => {
  try {
    const inputDir = path.join(__dirname, '..', '..', 'input');
    const outputDir = path.join(__dirname, '..', '..', 'output');

    // Ensure directories exist
    if (!fs.existsSync(inputDir)) {
      return res.status(400).json({ error: 'Input directory does not exist' });
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process resumes
    const results = await processResumes(inputDir, outputDir);

    // Read processed results
    const processedFile = path.join(outputDir, 'processed.csv');
    if (!fs.existsSync(processedFile)) {
      return res.status(404).json({ error: 'Processed file not found' });
    }

    const processedData = fs.readFileSync(processedFile, 'utf-8');
    const rows = processedData.split('\n').slice(1); // Skip header
    
    const formattedResults = rows
      .filter(row => row.trim())
      .map(row => {
        const columns = row.split(',').map(col => col.replace(/^"(.*)"$/, '$1'));
        return {
          response: {
            name: columns[0],
            result: columns[1],
            college: columns[2],
            degree: columns[6],
            gpa: columns[8],
            summary: columns[12]
          }
        };
      });

    res.json({ results: formattedResults });
  } catch (error) {
    console.error('Error processing resumes:', error);
    res.status(500).json({ error: 'Error processing resumes' });
  }
});

router.get("/process-resume/:jobPosition", async (req: any, res: any) => {
  try {
    const { jobPosition } = req.params; // Get job position from URL
    const inputDir = path.join(__dirname, "..", "..", "input");

    if (!fs.existsSync(inputDir)) {
      return res.status(400).json({ error: "Input directory does not exist" });
    }

    const resumeFiles = fs.readdirSync(inputDir).filter((file) => file.endsWith(".pdf"));
    if (resumeFiles.length === 0) {
      return res.status(400).json({ error: "No resumes found in input directory" });
    }
    const results: any[] = [];
    for (const file of resumeFiles) {
      const filePath = path.join(inputDir, file);
      const resumeText = await extractTextFromPdf(filePath);
      try {
        const evaluation = await invokeAnthropicForJob(resumeText, jobPosition);
        results.push({ name: file, response: evaluation.response });
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        results.push({ name: file, error: "Anthropic API Error" });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error("Error processing resumes:", error);
    res.status(500).json({ error: "Error processing resumes" });
  }
});

export default router;