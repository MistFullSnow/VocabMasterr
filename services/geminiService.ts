import { GoogleGenAI, Type } from "@google/genai";
import { QuizCategory, Question } from "../types";

const apiKey = process.env.API_KEY;
// We initialize lazily to ensure environment variable is ready, 
// though generally in this setup it is available at import time.
const getAI = () => new GoogleGenAI({ apiKey: apiKey });

const SYSTEM_INSTRUCTION = `
You are an expert verbal ability tutor for MBA CET exams. 
Generate challenging verbal ability questions.
Ensure distractors (wrong options) are plausible and confusing.
Provide clear, concise explanations.
`;

export const generateQuestions = async (
  category: QuizCategory,
  count: number,
  excludeWords: string[]
): Promise<Question[]> => {
  const ai = getAI();
  
  // Truncate exclude list if too long to save tokens, keep most recent 500
  const exclusionList = excludeWords.slice(-500).join(", ");
  
  let promptSpecifics = "";
  let targetWordDescription = "";

  // We only apply strict word exclusion to vocabulary-centric categories
  const isVocabCategory = [
    QuizCategory.SYNONYMS, 
    QuizCategory.ANTONYMS, 
    QuizCategory.IDIOMS, 
    QuizCategory.ONE_WORD
  ].includes(category);
  
  switch (category) {
    case QuizCategory.SYNONYMS:
      promptSpecifics = "Generate synonym questions. The 'targetWord' is the main word. The question should ask for the word most similar in meaning.";
      targetWordDescription = "The core word being tested";
      break;
    case QuizCategory.ANTONYMS:
      promptSpecifics = "Generate antonym questions. The 'targetWord' is the main word. The question should ask for the word opposite in meaning.";
      targetWordDescription = "The core word being tested";
      break;
    case QuizCategory.IDIOMS:
      promptSpecifics = "Generate idiom/phrase meaning questions. The 'targetWord' is the idiom itself. The question should provide the idiom and ask for its meaning.";
      targetWordDescription = "The idiom being tested";
      break;
    case QuizCategory.CLOZE:
      promptSpecifics = "Generate sentence completion (cloze) questions. The 'targetWord' is the correct answer that fits the blank. The question text must contain a '______' placeholder.";
      targetWordDescription = "The correct word filling the blank";
      break;
    case QuizCategory.ONE_WORD:
      promptSpecifics = "Generate one-word substitution questions. The question text describes a concept/person, and the answer is the single word for it. 'targetWord' is the answer.";
      targetWordDescription = "The answer word";
      break;
    case QuizCategory.SPOT_ERROR:
      promptSpecifics = "Generate 'Spot the Error' questions. The question text is a sentence divided into segments (e.g., A, B, C, D) or simply a sentence with a grammatical error. The options should be the specific segment text or 'No Error'. 'targetWord' should be the incorrect segment.";
      targetWordDescription = "The segment containing the error";
      break;
    case QuizCategory.SENTENCE_ARRANGEMENT:
      promptSpecifics = "Generate 'Sentence Arrangement' (Parajumbles) questions. The questionText must provide 4-5 jumbled sentences labeled A, B, C, D. The options must be sequences like 'BDAC', 'ACBD', etc. 'targetWord' is the correct sequence string.";
      targetWordDescription = "The correct sequence string";
      break;
    case QuizCategory.POSSIBLE_STARTERS:
      promptSpecifics = "Generate 'Possible Starters' questions. The questionText must provide two separate sentences and 3 possible starters labeled (i), (ii), (iii). The question asks which starters can combine the sentences meaningfully. Options should be like 'Only (i)', 'Both (i) and (ii)', etc. 'targetWord' is the correct option text.";
      targetWordDescription = "The correct option text";
      break;
  }

  let prompt = `
    Generate ${count} distinct ${category} questions for MBA CET preparation.
    ${promptSpecifics}
  `;

  if (isVocabCategory && exclusionList.length > 0) {
    prompt += `
    IMPORTANT: Do NOT use the following words/idioms as the correct answer (targetWord): [${exclusionList}].
    If the exclusion list is very long, just ensure you pick high-frequency MBA exam words that are NOT in that list.
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
              correctAnswer: { type: Type.STRING, description: "Must be exactly one of the strings in options" },
              explanation: { type: Type.STRING, description: "Why the answer is correct and others are wrong" }
            },
            required: ["type", "targetWord", "questionText", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Omit<Question, 'id'>[];
      // Add client-side IDs
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