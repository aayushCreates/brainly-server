type PromptProps = {
  userQuestion: string;
  relevantChunks: { text: string }[];
  recentMessages: any;
};

export const getPrompt = ({
  userQuestion,
  relevantChunks,
  recentMessages,
}: PromptProps) => {
  const context = relevantChunks
    .map((c: any, i: number) => `${i + 1}. ${c.text}`)
    .join("\n");

  const history = recentMessages
    .slice(-6)
    .map((m: any) => `${m.role}: ${m.content}`)
    .join("\n");

  return `
    SYSTEM:
    You are the user's second brain.
    You MUST answer only using the provided context.
    
    If the context is empty or irrelevant, respond with:
    "I don't have enough information in your brain to answer this."

    BRAIN CONTEXT:
    ${context}
    
    CONVERSATION HISTORY:
    ${history}
    
    USER QUESTION:
    ${userQuestion}
    

    ANSWER:
    - Use bullet points if possible
    - Reference the brain context implicitly
    - Do NOT add information not present in context

    `;
};
