import OpenAI from "openai";


const client = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
});

const getEmbeddedText = async (text: string): Promise<number[]>=> {
    try {
        const response = await client.embeddings.create({
            model: "text-embedding-3-small", // cheap + good
            input: text,
          });
        
          return (response as any).data[0].embedding;
    }catch(err) {
        throw new Error("Error in text embedding");
    }
}

export default getEmbeddedText;