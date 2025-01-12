// This file is used to extract the text from the PDF files

import pdfParse from "pdf-parse";
import fs from "fs";

async function extractTextFromPdf(pdfPath: string) {
  let dataBuffer = fs.readFileSync(pdfPath);
  let data = await pdfParse(dataBuffer);
  return data.text;
}

export { extractTextFromPdf };
