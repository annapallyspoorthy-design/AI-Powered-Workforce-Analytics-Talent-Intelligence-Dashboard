require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

async function testGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing from .env");
    return;
  }

  console.log("✅ Gemini API key found");
  console.log("🔄 Connecting to Gemini...");

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Reply with exactly: AURA AI Gemini connection is working.",
    });

    console.log("\n✅ Gemini response:");
    console.log(response.text);
  } catch (error) {
    console.error("\n❌ Gemini API error:");
    console.error(error);
  }
}

testGemini();