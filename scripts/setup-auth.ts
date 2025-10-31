#!/usr/bin/env tsx
import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import "dotenv/config";

async function setupAuth(app: "linear" | "notion") {
  console.log(`\n🔐 Setting up authentication for ${app.toUpperCase()}...\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // Navigate to login page
  if (app === "linear") {
    console.log("📱 Opening Linear login page...");
    console.log("   Please login manually in the browser that just opened.");
    await page.goto("https://linear.app/login");
  } else {
    console.log("📱 Opening Notion login page...");
    console.log("   Please login manually in the browser that just opened.");
    await page.goto("https://www.notion.so/login");
  }

  // Wait for user to login
  console.log("\n⏳ Waiting for you to complete login...");
  console.log("   The script will continue once you're logged in and on the main page.\n");

  // Wait for successful login (check for common authenticated page elements)
  if (app === "linear") {
    // Wait for Linear workspace page or sidebar
    await page.waitForFunction(
      () => {
        return document.querySelector('[data-sidebar]') !== null || document.querySelector('[role="navigation"]') !== null || window.location.href.includes("/team/");
      },
      { timeout: 300000 }
    ); // 5 minutes
  } else {
    // Wait for Notion workspace
    await page.waitForFunction(
      () => {
        return document.querySelector('[data-block-id]') !== null || document.querySelector('.notion-sidebar') !== null;
      },
      { timeout: 300000 }
    );
  }

  console.log("✅ Login detected! Saving authentication state...\n");

  // Save storage state
  const configDir = path.join(process.cwd(), "config");
  await mkdir(configDir, { recursive: true });

  const authPath = path.join(configDir, `${app}-auth.json`);
  const storageState = await context.storageState();
  await writeFile(authPath, JSON.stringify(storageState, null, 2));

  console.log(`💾 Authentication saved to: ${authPath}\n`);

  await browser.close();

  console.log(`✨ ${app.toUpperCase()} authentication setup complete!\n`);
  console.log("   You won't need to login again for future captures.\n");
}

// Parse command line arguments
const args = process.argv.slice(2);
const appIndex = args.indexOf("--app");

if (appIndex === -1 || !args[appIndex + 1]) {
  console.error("Usage: tsx scripts/setup-auth.ts --app <linear|notion>");
  process.exit(1);
}

const app = args[appIndex + 1].toLowerCase();

if (app !== "linear" && app !== "notion") {
  console.error("Error: app must be 'linear' or 'notion'");
  process.exit(1);
}

setupAuth(app as "linear" | "notion").catch((error) => {
  console.error("Error setting up authentication:", error);
  process.exit(1);
});


