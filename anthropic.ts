import { Anthropic } from '@anthropic-ai/sdk';
import { Usage } from '@anthropic-ai/sdk/resources/messages';

export type ResumeEvaluation = {
  response: {
    name: string;
    result: string;
    college: string;
    city: string;
    phone: string;
    gender: string;
    degree: string;
    year: string;
    gpa: string;
    interest1: string;
    interest2: string;
    interest3: string;
    summary: string;
    points: {
      collegeReputation: number;
      degree: number;
      gpa: number;
      projects: number;
      bonus: number;
    }
  },
  tokens: {
    input_tokens: number;
    output_tokens: number;
  }
}

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
`

export async function invokeAnthropic(pdfExtract: string): Promise<ResumeEvaluation> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = PROMPT.replace("{pdfExtract}", pdfExtract); 

  const completion = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.0,
  });

  const response = completion.content[0].type === 'text' 
  ? completion.content[0].text 
  : '';

  return { response: JSON.parse(response), tokens: completion.usage };
}

