#!/usr/bin/env tsx

/**
 * Run ONLY Notion tasks for testing
 */

import { NotionAdapter } from "../packages/backend/src/adapters/notion.js";
import { CaptureGraph } from "../packages/backend/src/graph/graph.js";
import "dotenv/config";

async function runNotionTasks() {
  console.log("🚀 Starting NOTION TASKS ONLY...\n");

  // Initialize Notion adapter
  const workspaceId = process.env.NOTION_WORKSPACE_ID || "";
  if (!workspaceId) {
    console.error("❌ NOTION_WORKSPACE_ID not set in .env");
    process.exit(1);
  }

  console.log(`📦 Using Notion workspace/database ID: ${workspaceId}\n`);
  
  const notionAdapter = new NotionAdapter(workspaceId, workspaceId);
  const tasks = notionAdapter.getTasks();

  // ONE run ID for ALL tasks in this execution
  const runId = new Date().toISOString().replace(/[:.]/g, "-").split("T").join("_").slice(0, 19);
  console.log(`🆔 Run ID: ${runId}\n`);

  let completed = 0;
  let failed = 0;

  for (const taskSpec of tasks) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Task: ${taskSpec.task_name}`);
    console.log(`   App: notion`);
    console.log(`   ID: ${taskSpec.task_id}`);
    console.log(`${"=".repeat(60)}\n`);

    const graph = new CaptureGraph("notion", taskSpec.task_id, taskSpec, runId);

    // Log events
    graph.onEvent((event) => {
      switch (event.type) {
        case "run_started":
          console.log(`   🏁 Run started: ${event.data.run_id}`);
          break;
        case "step_started":
          console.log(`   ▶️  Step ${event.data.step}: ${event.data.action} - ${event.data.target}`);
          break;
        case "detector_fired":
          console.log(`   🎯 Detector fired: ${event.data.detector} (confidence: ${event.data.confidence})`);
          break;
        case "vlm_verifying":
          console.log(`   🤖 VLM verifying: ${event.data.question}`);
          break;
        case "state_captured":
          console.log(`   📸 State captured: ${event.data.state_id}${event.data.caption ? ` - ${event.data.caption}` : ""}`);
          break;
        case "capture_rejected":
          console.log(`   ❌ Capture rejected: ${event.data.reason}`);
          break;
        case "error":
          console.log(`   ⚠️  Error: ${event.data.message}`);
          break;
      }
    });

    try {
      const result = await graph.run();
      
      // Check the actual result status - don't trust that it completed
      if (result.status === "failed") {
        console.error(`\n   ❌ Task FAILED: ${result.error || "Unknown error"}\n`);
        failed++;
      } else if (result.status === "completed") {
        console.log(`\n   ✅ Task completed successfully!\n`);
        completed++;
      } else {
        console.error(`\n   ⚠️  Task ended with unexpected status: ${result.status}\n`);
        failed++;
      }
    } catch (error: any) {
      console.error(`\n   ❌ Task crashed: ${error.message}\n`);
      failed++;
    }

    // Wait between tasks
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Summary:`);
  console.log(`   ✅ Completed: ${completed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Check ./runs/ for captured screenshots`);
  console.log(`${"=".repeat(60)}\n`);
  
  // Force exit to ensure all browsers are closed
  process.exit(0);
}

runNotionTasks().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


