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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const Filerouter = express_1.default.Router();
// Define the directory for storing uploaded files
const inputDir = path_1.default.join(__dirname, '..', '..', 'input');
// Function to ensure directory exists
const ensureDirExists = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
// Multer configuration for file storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.params.userId;
        const jobTitle = req.params.jobTitle;
        const uploadDir = path_1.default.join(inputDir, userId, jobTitle);
        ensureDirExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original name
    }
});
const upload = (0, multer_1.default)({ storage: storage });
/**
 * @route   POST /resumes/upload/:userId/:jobTitle
 * @desc    Upload resumes for a specific user and job title
 * @access  Private
 */
Filerouter.post('/upload/:userId/:jobTitle', upload.array('resumes'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            res.status(400).json({ message: 'No files uploaded.' });
            return;
        }
        const userId = req.params.userId;
        const jobTitle = req.params.jobTitle;
        // Map the files array to include file paths
        const files = Array.from(req.files).map(file => ({
            name: file.originalname,
            filePath: path_1.default.join(inputDir, userId, jobTitle, file.originalname)
        }));
        res.status(200).json({ message: 'Files uploaded successfully.', files: files });
    }
    catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ message: 'File upload failed.', error: error });
    }
}));
exports.default = Filerouter;
