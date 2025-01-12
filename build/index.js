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
exports.processResumes = processResumes;
const dotenv_1 = __importDefault(require("dotenv"));
const pdf_extract_1 = require("./pdf-extract");
const anthropic_1 = require("./anthropic");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
function checkResume(pdfPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let text = yield (0, pdf_extract_1.extractTextFromPdf)(pdfPath);
        console.log(`Text: ${text}, ${text.trim().length}`);
    });
}
function processResumes(inputDir, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Process resumes from", inputDir, "to", outputDir);
        // get all pdf files in input directory
        const pdfFiles = fs_1.default.readdirSync(inputDir).filter(file => file.endsWith(".pdf"));
        let processed = 0;
        for (const pdfFile of pdfFiles) {
            processed++;
            try {
                console.log(`Processing ${processed}/${pdfFiles.length} - ${pdfFile}`);
                let text = yield (0, pdf_extract_1.extractTextFromPdf)(inputDir + "/" + pdfFile);
                if (text.trim().length < 100) {
                    console.error("Skipping", pdfFile, `because it is too short - ${text.trim().length}`);
                    continue;
                }
                let result = yield (0, anthropic_1.invokeAnthropic)(text);
                // write to processed.csv
                let resultLine = '';
                let totalPoints = result.response.points.collegeReputation + result.response.points.degree
                    + result.response.points.gpa + result.response.points.projects + result.response.points.bonus;
                resultLine += `"${result.response.name}",`;
                resultLine += `${result.response.result},`;
                resultLine += `"${result.response.college}",`;
                resultLine += `"${result.response.city}",`;
                resultLine += `"${result.response.phone}",`;
                resultLine += `${result.response.gender},`;
                resultLine += `"${result.response.degree}",`;
                resultLine += `"${result.response.year}",`;
                resultLine += `"${result.response.gpa}",`;
                resultLine += `"${result.response.interest1}",`;
                resultLine += `"${result.response.interest2}",`;
                resultLine += `"${result.response.interest3}",`;
                resultLine += `"${result.response.summary}",`;
                resultLine += `${result.response.points.collegeReputation},`;
                resultLine += `${result.response.points.degree},`;
                resultLine += `${result.response.points.gpa},`;
                resultLine += `${result.response.points.projects},`;
                resultLine += `${result.response.points.bonus},`;
                resultLine += `${totalPoints},`;
                resultLine += `${result.tokens.input_tokens},`;
                resultLine += `${result.tokens.output_tokens},`;
                resultLine += `${new Date().toISOString()}\n`;
                fs_1.default.appendFileSync(outputDir + "/processed.csv", resultLine);
                // copy the pdf file to the processed directory
                // create a new directory with the first letter of the name, capitalize it
                let firstLetter = result.response.name[0].toUpperCase();
                let newDir = outputDir + "/" + firstLetter;
                if (!fs_1.default.existsSync(newDir)) {
                    fs_1.default.mkdirSync(newDir);
                }
                // copy the pdf file to the new directory, rename it NAME_<filename>.pdf. Replace spaces with underscores.
                let newFileName = result.response.name.replace(/ /g, "_") + "_" + pdfFile;
                fs_1.default.copyFileSync(inputDir + "/" + pdfFile, newDir + "/" + newFileName);
                return resultLine;
            }
            catch (error) {
                console.error("Error processing", pdfFile, error);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // check if input directory exists
        if (!fs_1.default.existsSync(process.env.DIR_INPUT || "input")) {
            console.error(`Input directory ${process.env.DIR_INPUT || "input"} does not exist`);
            return;
        }
        // check if output directory exists. If not, create it.
        if (!fs_1.default.existsSync(process.env.DIR_OUTPUT || "output")) {
            fs_1.default.mkdirSync(process.env.DIR_OUTPUT || "output");
        }
        let inputDir = process.env.DIR_INPUT || "input";
        let outputDir = process.env.DIR_OUTPUT || "output";
        // check if processed.csv exists in the output directory. If so, exit. Otherwise, create an empty one.
        if (fs_1.default.existsSync(outputDir + "/processed.csv")) {
            console.log("Processed.csv already exists in the output directory. Will append to it.");
        }
        else {
            console.log("Processed.csv does not exist in the output directory. Will create an empty one.");
            // create an empty processed.csv file
            fs_1.default.writeFileSync(outputDir + "/processed.csv", "name,result,college,city,phone,gender,degree,year,gpa,interest1,interest2,interest3,summary,points_collegeReputation,points_degree,points_gpa,points_projects,points_bonus,points_total,tokens_input,tokens_output,timestamp\n");
        }
        // processResumes(inputDir, outputDir);
    });
}
main();
//checkResume("./test.pdf");
