import { GoogleGenAI, Type } from "@google/genai";
import { QuizCategory, Question, Difficulty } from "../types";

// We initialize lazily to ensure environment variable is ready.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert verbal ability tutor specifically for the MAH MBA CET exam.
The CET exam focuses on speed, accuracy, and contextual understanding.
Your goal is to generate high-quality questions that mimic the actual exam pattern.
Make the questions engaging and diverse.
`;

export const generateQuestions = async (
  category: QuizCategory,
  difficulty: Difficulty,
  count: number,
  excludeWords: string[]
): Promise<Question[]> => {
  const ai = getAI();
  
  // Truncate exclude list if too long
  const exclusionList = excludeWords.slice(-500).join(", ");
  
  let difficultyPrompt = "";
  switch (difficulty) {
    case Difficulty.EASY:
      difficultyPrompt = "Level: Beginner. Use common vocabulary. Options should have clear distinctions. Focus on building confidence.";
      break;
    case Difficulty.MEDIUM:
      difficultyPrompt = "Level: MAH MBA CET Standard. Use moderate vocabulary frequent in CET. Options should be close but distinguishable by context. Focus on speed and accuracy.";
      break;
    case Difficulty.HARD:
      difficultyPrompt = "Level: Advanced/CAT. Use high-level vocabulary and complex sentence structures. Options should be very close synonyms or confusing distractors. Focus on deep understanding.";
      break;
  }

  let promptSpecifics = "";
  let targetWordDescription = "";

  const isVocabCategory = [
    QuizCategory.SYNONYMS, 
    QuizCategory.ANTONYMS, 
    QuizCategory.IDIOMS, 
    QuizCategory.ONE_WORD
  ].includes(category);
  
  switch (category) {
    case QuizCategory.SYNONYMS:
      promptSpecifics = "Generate synonym questions. Provide a sentence where the target word is used in context if possible, or just the word. Ask for the nearest meaning.";
      targetWordDescription = "The core word being tested";
      break;
    case QuizCategory.ANTONYMS:
      promptSpecifics = "Generate antonym questions. Provide a context sentence. Ask for the opposite meaning.";
      targetWordDescription = "The core word being tested";
      break;
    case QuizCategory.IDIOMS:
      promptSpecifics = "Generate idiom questions. Use the idiom in a sentence or ask for its meaning directly. Options should be plausible interpretations.";
      targetWordDescription = "The idiom being tested";
      break;
    case QuizCategory.CLOZE:
      promptSpecifics = "Generate Cloze Test questions. Provide a short paragraph or sentence with a blank. Options must be grammatically and contextually relevant.";
      targetWordDescription = "The correct word filling the blank";
      break;
    case QuizCategory.ONE_WORD:
      promptSpecifics = "Generate One Word Substitution questions. Describe a person, practice, or state. Options should be specific terms.";
      targetWordDescription = "The answer word";
      break;
    case QuizCategory.SPOT_ERROR:
      promptSpecifics = "Generate Spot the Error questions. A sentence divided into parts (A, B, C, D). One part has a grammatical error relevant to CET (Subject-Verb agreement, Tenses, Prepositions).";
      targetWordDescription = "The segment containing the error";
      break;
    case QuizCategory.SENTENCE_ARRANGEMENT:
      promptSpecifics = "Generate Parajumbles. 4-5 sentences. Options are sequences. Logic should be based on connectors (However, Therefore) and pronouns.";
      targetWordDescription = "The correct sequence string";
      break;
    case QuizCategory.POSSIBLE_STARTERS:
      promptSpecifics = "Generate Possible Starters. Two sentences and 3 starters. Check which starters retain the meaning when combining sentences.";
      targetWordDescription = "The correct option text";
      break;
  }

  let prompt = `
    Generate ${count} distinct ${category} questions.
    ${difficultyPrompt}
    ${promptSpecifics}
  `;

  if (isVocabCategory && exclusionList.length > 0) {
    prompt += `
    IMPORTANT: Do NOT use the following words/idioms as the correct answer: [${exclusionList}].
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: Object.values(QuizCategory) },
              targetWord: { type: Type.STRING, description: targetWordDescription },
              questionText: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 4 options including the correct answer" 
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING, description: "Why the answer is correct." },
              hint: { type: Type.STRING, description: "A subtle clue, like the first letter, a rhyming word, or a usage context. Do not give the answer away." }
            },
            required: ["type", "targetWord", "questionText", "options", "correctAnswer", "explanation", "hint"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Omit<Question, 'id'>[];
      return data.map((q, index) => ({
        ...q,
        id: `${Date.now()}-${index}`
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw error;
  }
};