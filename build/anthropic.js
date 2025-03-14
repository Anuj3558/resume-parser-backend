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
exports.invokeAnthropic = invokeAnthropic;
exports.invokeAnthropicForJob = invokeAnthropicForJob;
const sdk_1 = require("@anthropic-ai/sdk");
const xlsx_1 = __importDefault(require("xlsx"));
const PROMPT = `
  I want to shortlist candidates for internship. I am looking for motivated candidates that are: 
   - studying in engineering, preferably CSE. 
   - Motivated, as shown by some good projects, not run-of-the mill or cookie cutter type  
   - Decent GPA >= 7.5/10

  Here is the rubric for points:
   - College Reputation - 1 to 4 (For IIT, NIT, IIIT, 4 points, For other colleges, 1 to 3)
   - Degree Fit - 1 to 3 (For B.E, M.E, B.Tech, M.Tech, 2 points, CSE/IT additional 1 point)
   - GPA - 1 to 4 (For >8/10, 3 points, >9/10, 4 points). If GPA is not mentioned, prorate it based on motivation & projects.
   - Motivation & Projects - 1 to 6 (For average/common, 1 to 2 points, for good, 3 to 4 points, for exceptional, 5 to 6 points)
   - Bonus Points - Max 3 ( +1 for elite programming contests like ACM ICPC, +1 for good standing in Leetcode, Codeforces, Codechef etc., +1 for stellar extra-curricular activities or any other achievements). If no bonus, set it to 0.

  You should return ONLY a JSON in this format. Do not return anything else:
  { name, result, college, city, phone, gender, degree, year, gpa, interest1, interest2, interest3, summary, points: { collegeReputation, degree, gpa, projects } }

  The gender should be either "Male" or "Female". If you are not able to determine the gender, then set it to "Unknown".
  The degree should be like "B.E, B.Tech etc.". If it is not mentioned, then set it to "Unknown".
  The year should be like "I, II, III etc.". If it is not mentioned, then set it to "Unknown".
  The gpa should be the gpa mentioned in the resume. It should be a floating point number. If it is not mentioned, then set it to "Unknown".
  The interest1, interest2, interest3 should be the interests of the candidate in that order. It can be one of {Algorithms, Generative AI,Machine Learning, Deep Learning, Computer Vision, NLP, Robotics, Computer Graphics, Computer Security, Software Engineering, Web Development, Mobile Development, Game Development, NLP, Robotics, Software Engineering, Java, JavaScript, Go, Python, UI/UX, Product Development, Data Visualization}. If the candidate is not interested in any of these, then set it to "Unknown".
  The summary should be max two sentences of the evaluation.
  The result should be either "Success" or "Fail". If you are able to make an evaluation, then result should be "Success". 
  If you are not able to make an evaluation based on the information provided, then result should be "Fail". In that case, mention the reason in the summary.

  Evaluate the following resume:
  {pdfExtract}
`;
function invokeAnthropic(pdfExtract) {
    return __awaiter(this, void 0, void 0, function* () {
        const anthropic = new sdk_1.Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        const prompt = PROMPT.replace("{pdfExtract}", pdfExtract);
        const completion = yield anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.0,
        });
        const response = completion.content[0].type === "text" ? completion.content[0].text : "";
        return { response: JSON.parse(response), tokens: completion.usage };
    });
}
function getPromptFromExcel(jobPosition) {
    const workbook = xlsx_1.default.readFile("./Prompts.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx_1.default.utils.sheet_to_json(sheet);
    const entry = data.find((row) => row["Job Position"].toLowerCase() === jobPosition.toLowerCase());
    return entry ? entry.Prompt : null;
}
function invokeAnthropicForJob(pdfExtract, jobTitle, jobDescription) {
    return __awaiter(this, void 0, void 0, function* () {
        const anthropic = new sdk_1.Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        // Construct the prompt dynamically using job title, job description, and PDF text
        const prompt = `
    Job Title: ${jobTitle}
    Job Description: ${jobDescription}

    Evaluate the following resume for the above job:
    ${pdfExtract}

    Use the following rubric for evaluation:
    - College Reputation: 1 to 4
    - Degree Fit: 1 to 3
    - GPA: 1 to 4
    - Motivation & Projects: 1 to 6
    - Bonus Points: Max 3

    Return ONLY a JSON in this format:
    {
      name: string,
      result: "Success" | "Fail",
      college: string,
      matchingScore: number(0-100),
      summary: string,
      city:String,
      phone:String,
      gender:String 
      degree:String,
      year:String,
      intrest:["technology1","technology2"],
    }
  `;
        const completion = yield anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.0,
        });
        const response = completion.content[0].type === "text" ? completion.content[0].text : "";
        console.log("Ai responded with -> ", response);
        return { response: JSON.parse(response), tokens: completion.usage };
    });
}
