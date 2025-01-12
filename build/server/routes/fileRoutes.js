"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const uploadDir = path_1.default.join(__dirname, '../../input');
// Ensure the uploads directory exists
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
// Generate HTML snippet for a single file
const generateFileHtml = (fileName) => {
    const filePath = `/input/${fileName}`;
    return `<li><span class="cursor-pointer" onclick="window.location.href='${filePath}'; " target="_blank">${fileName}</span></li>`;
};
// Handle file uploads
router.post('/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || !req.files.pdf) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }
        const files = Array.isArray(req.files.pdf) ? req.files.pdf : [req.files.pdf];
        const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const uploadPath = path_1.default.join(uploadDir, file.name);
            yield file.mv(uploadPath);
            return {
                name: file.name,
                path: `/input/${file.name}`,
                uploadDate: new Date()
            };
        }));
        const uploadedFiles = yield Promise.all(uploadPromises);
        res.json({ files: uploadedFiles });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading files.' });
    }
}));
// Fetch all uploaded files
router.get('/list', (req, res) => {
    try {
        const files = fs_1.default.readdirSync(uploadDir);
        const fileList = files.map(filename => ({
            name: filename,
            path: `/input/${filename}`,
            uploadDate: fs_1.default.statSync(path_1.default.join(uploadDir, filename)).mtime
        }));
        res.json({ files: fileList });
    }
    catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: 'Error fetching file list.' });
    }
});
// Get specific PDF file
router.get('/pdf/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        if (!filename.toLowerCase().endsWith('.pdf')) {
            return res.status(400).json({ error: 'Invalid file type.' });
        }
        const filePath = path_1.default.join(uploadDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found.' });
        }
        res.sendFile(filePath);
    }
    catch (error) {
        console.error('PDF fetch error:', error);
        res.status(500).json({ error: 'Error fetching PDF.' });
    }
});
// Delete specific file
router.delete('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(uploadDir, filename);
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found.' });
        }
        // Verify it's a PDF file
        if (!filename.toLowerCase().endsWith('.pdf')) {
            return res.status(400).json({ error: 'Invalid file type.' });
        }
        // Delete the file
        fs_1.default.unlinkSync(filePath);
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting file.' });
    }
});
exports.default = router;
