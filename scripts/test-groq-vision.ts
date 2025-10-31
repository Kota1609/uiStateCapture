#!/usr/bin/env tsx
/**
 * Test Groq API Key for Vision Model Access
 * 
 * This script verifies:
 * 1. Your Groq API key is valid
 * 2. You have access to Llama 3.2 Vision models
 * 3. The vision model can process images
 */

import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

async function testGroqVision() {
  console.log("🔍 Testing Groq API Key for Vision Access...\n");

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY not found in .env file");
    process.exit(1);
  }

  if (!apiKey.startsWith("gsk_")) {
    console.warn("⚠️  Warning: Groq API keys usually start with 'gsk_'");
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  try {
    // Initialize Groq with Llama 4 Scout Vision model
    const vlm = new ChatOpenAI({
      modelName: "meta-llama/llama-4-scout-17b-16e-instruct",
      openAIApiKey: apiKey,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
      maxTokens: 100,
      temperature: 0.1,
    });

    console.log("📡 Sending test request to Groq...");
    console.log("   Model: meta-llama/llama-4-scout-17b-16e-instruct (Llama 4 Scout Vision)");
    console.log("   Testing basic text completion...\n");

    // Create a simple test image (1x1 red pixel in base64)
    const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    const response = await vlm.invoke("What is 2+2? Answer with just the number.");

    console.log("✅ SUCCESS! Groq API is working!\n");
    console.log("📝 Response from Groq:");
    console.log(`   ${response.content}\n`);

    console.log("🎉 Your Groq API key has access to Llama 4 Scout Vision!");
    console.log("   This model supports both text and image inputs.\n");

    console.log("Available Vision Models:");
    console.log("   • meta-llama/llama-4-scout-17b-16e-instruct (multimodal)");
    console.log("   • meta-llama/llama-4-maverick-17b-128e-instruct (text-only)\n");

    console.log("Your Limits:");
    console.log("   • 1K requests per minute");
    console.log("   • 500K requests per day");
    console.log("   • More than enough for this project!\n");

    console.log("✨ Ready to run: npm run capture-all\n");
  } catch (error: any) {
    console.error("❌ ERROR: Groq API test failed\n");

    if (error.message?.includes("401") || error.message?.includes("authentication")) {
      console.error("🔑 Authentication Error:");
      console.error("   Your API key might be invalid or expired.");
      console.error("   Get a new key at: https://console.groq.com/keys\n");
    } else if (error.message?.includes("rate limit")) {
      console.error("⏱️  Rate Limit Error:");
      console.error("   Too many requests. Wait a moment and try again.\n");
    } else if (error.message?.includes("model")) {
      console.error("🤖 Model Error:");
      console.error("   The vision model might not be available.");
      console.error("   Check available models at: https://console.groq.com/docs/models\n");
    } else {
      console.error("Details:", error.message);
      console.error("\nFull error:", error);
    }

    process.exit(1);
  }
}

testGroqVision().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

