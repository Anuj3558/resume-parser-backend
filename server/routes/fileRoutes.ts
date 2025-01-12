import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { FileArray, UploadedFile } from 'express-fileupload';

const router = Router();
const uploadDir = path.join(__dirname, '../../input');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Generate HTML snippet for a single file
const generateFileHtml = (fileName: string): string => {
  const filePath = `/input/${fileName}`;
  return `<li><span class="cursor-pointer" onclick="window.location.href='${filePath}'; " target="_blank">${fileName}</span></li>`;
};



  


// Interface for file response
interface FileResponse {
  name: string;
  path: string;
  uploadDate: Date;
}

// Handle file uploads
router.post('/upload', async (req: any, res: any) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const files = Array.isArray(req.files.pdf) ? req.files.pdf : [req.files.pdf];
    
    const uploadPromises = files.map(async (file: UploadedFile) => {
      const uploadPath = path.join(uploadDir, file.name);
      await file.mv(uploadPath);
      return {
        name: file.name,
        path: `/input/${file.name}`,
        uploadDate: new Date()
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading files.' });
  }
});

// Fetch all uploaded files
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const fileList: FileResponse[] = files.map(filename => ({
      name: filename,
      path: `/input/${filename}`,
      uploadDate: fs.statSync(path.join(uploadDir, filename)).mtime
    }));
    res.json({ files: fileList });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Error fetching file list.' });
  }
});

// Get specific PDF file
router.get('/pdf/:filename', (req: any, res: any) => {
  try {
    const { filename } = req.params;
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Invalid file type.' });
    }

    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('PDF fetch error:', error);
    res.status(500).json({ error: 'Error fetching PDF.' });
  }
});

// Delete specific file
router.delete('/:filename', (req:any, res:any) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Verify it's a PDF file
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Invalid file type.' });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Error deleting file.' });
  }
});

export default router;