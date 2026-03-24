import { GoogleGenerativeAI } from "@google/generative-ai";
import dns from "dns";

// Fix Node.js 18+ fetch timeout issues with Google domains on certain networks by preferring IPv4
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  console.warn("Could not set DNS result order", e);
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Use globalThis to persist cache across Next.js API route hot-reloads in development
const globalForGemini = globalThis as unknown as {
  geminiCache: Record<string, string>;
};

if (!globalForGemini.geminiCache) {
  globalForGemini.geminiCache = {};
}

export const generateInsights = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }
  
  if (globalForGemini.geminiCache[prompt]) {
    console.log("Serving Gemini response from cache");
    return globalForGemini.geminiCache[prompt];
  }

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      globalForGemini.geminiCache[prompt] = text;
      return text;
    } catch (error: any) {
      console.error(`Gemini API error (${retries} retries left):`, error.message);
      
      // If we hit a 429 Quota limit, don't bother retrying with 1-4s backoffs, just fail fast
      if (error.message && error.message.includes("429")) {
        throw new Error("QUOTA_EXCEEDED");
      }

      retries--;
      if (retries === 0) {
        throw new Error("Failed to generate AI insights after multiple attempts.");
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff: 1s, 2s, 4s
    }
  }
  
  throw new Error("Failed to generate AI insights.");
};
