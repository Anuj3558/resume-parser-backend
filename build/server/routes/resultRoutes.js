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
const index_1 = require("../../index");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
router.get('/process-resumes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inputDir = path_1.default.join(__dirname, '..', '..', 'input');
        console.log(inputDir);
        const outputDir = path_1.default.join(__dirname, '..', '..', 'output');
        // Ensure directories exist
        if (!fs_1.default.existsSync(inputDir)) {
            return res.status(400).json({ error: 'Input directory does not exist' });
        }
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        // Process resumes
        const results = yield (0, index_1.processResumes)(inputDir, outputDir);
        // Read processed results
        const processedFile = path_1.default.join(outputDir, 'processed.csv');
        if (!fs_1.default.existsSync(processedFile)) {
            return res.status(404).json({ error: 'Processed file not found' });
        }
        const processedData = fs_1.default.readFileSync(processedFile, 'utf-8');
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
    }
    catch (error) {
        console.error('Error processing resumes:', error);
        res.status(500).json({ error: 'Error processing resumes' });
    }
}));
exports.default = router;
