import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { LessonData, Chunk } from "../types";

// Shared Schema for Chunks
const chunkSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    isWord: { type: Type.BOOLEAN },
    meaning: { type: Type.STRING, nullable: true },
    lemma: { type: Type.STRING, nullable: true }
  },
  required: ["text", "isWord"]
};

// Singleton instance
let aiInstance: GoogleGenAI | null = null;

// Lazy initialization to prevent top-level crashes in browser
const getAI = () => {
  if (aiInstance) return aiInstance;

  // Prioritize VITE_API_KEY for Vite/Vercel environments
  let apiKey = (import.meta as any).env?.VITE_API_KEY;

  // Fallback to process.env (Node/Standard) only if VITE key is missing
  if (!apiKey && typeof process !== 'undefined' && process.env) {
    apiKey = process.env.API_KEY || process.env.VITE_API_KEY;
  }

  if (!apiKey) {
    console.error("API Key not found in VITE_API_KEY or process.env.API_KEY");
    // Throwing a specific error string that App.tsx catches to show the guide
    throw new Error("VITE_API_KEY_MISSING"); 
  }

  // Sanitization: Trim whitespace
  apiKey = apiKey.trim();

  // Common User Mistake: Pasting the variable name into the value
  if (apiKey.startsWith("VITE_API_KEY") || apiKey.includes("=")) {
     throw new Error("INVALID_KEY_FORMAT_PREFIX");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
};

// 1. Generate Lesson Text Content with Granularity
export const generateLessonContent = async (scenario: string): Promise<LessonData> => {
  const ai = getAI();

  const prompt = `
    你是一位专业的西班牙语私教。
    场景: "${scenario}"
    
    请生成一个 JSON 对象，包含一段 A2 水平的实用对话（3-5 个句子）。
    关键要求：你需要将每一个句子拆解为“碎片(chunks)”，以便前端可以互动。
    
    chunks 规则：
    1. 将句子完全拆解，包括单词、标点、空格。
    2. 所有 chunks 的 text 拼接起来必须等于原句子。
    3. 对于单词 (isWord: true)，提供中文释义 (meaning) 和原型 (lemma)。
    4. 对于空格或标点，isWord 为 false。

    Example JSON Structure:
    {
      "scenario": "...",
      "tips": "...",
      "sentences": [
        {
          "spanish": "Hola, ¿cómo estás?",
          "chinese": "你好，你好吗？",
          "chunks": [
            { "text": "Hola", "isWord": true, "meaning": "你好", "lemma": "hola" },
            { "text": ", ", "isWord": false },
            { "text": "¿", "isWord": false },
            { "text": "cómo", "isWord": true, "meaning": "如何", "lemma": "cómo" },
            { "text": " ", "isWord": false },
            { "text": "estás", "isWord": true, "meaning": "你在", "lemma": "estar" },
            { "text": "?", "isWord": false }
          ]
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING },
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                spanish: { type: Type.STRING },
                chinese: { type: Type.STRING },
                chunks: {
                  type: Type.ARRAY,
                  items: chunkSchema
                }
              },
              required: ["spanish", "chinese", "chunks"]
            }
          },
          tips: { type: Type.STRING }
        },
        required: ["scenario", "sentences", "tips"]
      }
    }
  });

  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr) as LessonData;
};

// 2. Generate Speech from Text
export const generateLessonAudio = async (text: string): Promise<string> => {
  const ai = getAI();
  if (!text) return "";
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("Failed to generate audio");
  }

  return base64Audio;
};

// 3. Start A2 Chat Session
export const startA2Chat = () => {
  const ai = getAI();
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "Eres un profesor de español amable. Tu estudiante tiene nivel A2. Responde SIEMPRE en formato JSON estructurado que incluya el texto español, traducción al chino, y análisis de palabras (chunks). Mantén respuestas cortas y corrige errores amablemente."
    }
  });
};

// 4. Send Message and Parse Structure
export const sendA2ChatMessage = async (chatSession: Chat, message: string) => {
  // Ensure Key is valid before sending
  getAI(); 
  
  const result = await chatSession.sendMessage({ 
    message: message,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          spanish: { type: Type.STRING },
          chinese: { type: Type.STRING },
          chunks: {
            type: Type.ARRAY,
            items: chunkSchema
          }
        },
        required: ["spanish", "chinese", "chunks"]
      }
    }
  });

  const jsonStr = result.text || "{}";
  return JSON.parse(jsonStr) as { spanish: string; chinese: string; chunks: Chunk[] };
};