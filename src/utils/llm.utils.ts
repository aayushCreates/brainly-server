import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
});

export const callLLM = async (prompt: string)=> {
    try {
        const response = await client.responses.create({
            model: "gpt-4o-mini",
            input: [
              {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: prompt
                    }
                ]
              }
            ],
            temperature: 0.3
        });

        return response.output_text;

    }catch(err) {
        throw new Error("Error in calling llm for genearting response");
    }
}
