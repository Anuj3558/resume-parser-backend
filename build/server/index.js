"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputDir = exports.inputDir = void 0;
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const resultRoutes_1 = __importDefault(require("./routes/resultRoutes"));
const fs_1 = __importDefault(require("fs"));
const authRoutes_1 = __importDefault(require("./auth/authRoutes"));
const app = (0, express_1.default)();
const PORT = 4000;
exports.inputDir = path_1.default.join(__dirname, 'input');
exports.outputDir = path_1.default.join(__dirname, 'output');
// Absolute path to output folder
// Middleware
app.use(express_1.default.static('views'));
app.use('/input', express_1.default.static(exports.inputDir));
app.use('/output', express_1.default.static(exports.outputDir));
app.use((0, express_fileupload_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
// Routes
app.use('/auth', authRoutes_1.default);
// Protected routes
app.use('/files', fileRoutes_1.default);
app.use('/results', resultRoutes_1.default);
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'index.html'));
});
app.post('/config/update', (req, res) => {
    const { inputDir, outputDir } = req.body;
    // Validate inputs (optional)
    if (!inputDir && !outputDir) {
        return res.status(400).send("No directories provided.");
    }
    const envFilePath = path_1.default.join(__dirname, '../.env');
    let envConfig = fs_1.default.readFileSync(envFilePath, 'utf-8');
    if (inputDir) {
        envConfig = envConfig.replace(/INPUT_DIR=.*/, `INPUT_DIR=${inputDir}`);
    }
    if (outputDir) {
        envConfig = envConfig.replace(/OUTPUT_DIR=.*/, `OUTPUT_DIR=${outputDir}`);
    }
    // Update .env file
    fs_1.default.writeFileSync(envFilePath, envConfig);
    res.send(`<div class="text-green-400">Directories updated successfully!</div>`);
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});