import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export const callLLM = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    return completion.choices[0].message.content || "";
  } catch (err: any) {
    console.log("Error in calling llm", err);
    throw new Error(`Error in calling llm: ${err.message || err}`);
  }
};