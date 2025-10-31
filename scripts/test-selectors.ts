#!/usr/bin/env tsx
/**
 * Test and fix Linear selectors by actually checking what's on the page
 */

import { chromium } from "playwright";
import { readFileSync } from "fs";
import path from "path";

async function testLinearSelectors() {
  console.log("🔍 Testing Linear selectors...\n");

  const authPath = path.join(process.cwd(), "config", "linear-auth.json");
  const storageState = JSON.parse(readFileSync(authPath, "utf-8"));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    storageState,
  });

  const page = await context.newPage();

  try {
    // Navigate to projects
    console.log("📍 Navigating to projects page...");
    await page.goto("https://linear.app/test-softlight/projects", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Check what "New project" button actually is
    console.log("\n🔍 Looking for 'New project' button...");
    
    // Try different selectors
    const attempts = [
      { desc: 'role=button, name="New project"', selector: page.getByRole("button", { name: "New project" }) },
      { desc: 'role=button, name="New Project"', selector: page.getByRole("button", { name: "New Project" }) },
      { desc: 'text="New project"', selector: page.getByText("New project") },
      { desc: 'text="New Project"', selector: page.getByText("New Project") },
      { desc: '[data-testid*="new"]', selector: page.locator('[data-testid*="new"]') },
      { desc: 'button containing "New"', selector: page.locator("button:has-text('New')") },
    ];

    for (const attempt of attempts) {
      try {
        const count = await attempt.selector.count();
        if (count > 0) {
          console.log(`✅ Found ${count} element(s) with: ${attempt.desc}`);
          const text = await attempt.selector.first().textContent();
          console.log(`   Text: "${text}"`);
        }
      } catch (e) {
        console.log(`❌ Failed: ${attempt.desc}`);
      }
    }

    // List all buttons
    console.log("\n📋 All buttons on page:");
    const buttons = await page.locator("button, [role='button']").all();
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      const text = await buttons[i].textContent();
      const ariaLabel = await buttons[i].getAttribute("aria-label");
      if (text || ariaLabel) {
        console.log(`   ${i + 1}. Text: "${text?.trim()}" | Aria: "${ariaLabel}"`);
      }
    }

    console.log("\n⏸️  Pausing for 60 seconds - check the page manually");
    console.log("   Close browser when done\n");
    
    await page.waitForTimeout(60000);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

testLinearSelectors();

