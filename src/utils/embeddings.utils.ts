import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

const getEmbeddedText = async (text: string): Promise<number[]> => {
  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err: any) {
    console.error("Gemini embedding error: ", err);
    throw new Error("Error in text embedding");
  }
};

export default getEmbeddedText;
