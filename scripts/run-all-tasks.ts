#!/usr/bin/env tsx
import { LinearAdapter } from "../packages/backend/src/adapters/linear.js";
import { NotionAdapter } from "../packages/backend/src/adapters/notion.js";
import { CaptureGraph } from "../packages/backend/src/graph/graph.js";
import "dotenv/config";

async function runAllTasks() {
  console.log("🚀 Starting all capture tasks...\n");

  // Initialize adapters
  const linearAdapter = new LinearAdapter(process.env.LINEAR_WORKSPACE || "test-softlight");
  const notionAdapter = new NotionAdapter(process.env.NOTION_WORKSPACE_ID || "");

  const allTasks = [
    { app: "linear" as const, tasks: linearAdapter.getTasks() },
    { app: "notion" as const, tasks: notionAdapter.getTasks() },
  ];

  // ONE run ID for ALL tasks in this execution
  const runId = new Date().toISOString().replace(/[:.]/g, "-").split("T").join("_").slice(0, 19);
  console.log(`🆔 Run ID: ${runId}\n`);

  let completed = 0;
  let failed = 0;

  for (const { app, tasks } of allTasks) {
    for (const taskSpec of tasks) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📋 Task: ${taskSpec.task_name}`);
      console.log(`   App: ${app}`);
      console.log(`   ID: ${taskSpec.task_id}`);
      console.log(`${"=".repeat(60)}\n`);

      const graph = new CaptureGraph(app, taskSpec.task_id, taskSpec, runId);

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
          case "run_completed":
            console.log(`   ✅ Run completed: ${event.data.captures} captures in ${event.data.duration_ms}ms`);
            break;
          case "run_failed":
            console.log(`   ❌ Run failed: ${event.data.error}`);
            break;
        }
      });

      try {
        const finalState = await graph.run();

        if (finalState.status === "completed") {
          completed++;
          console.log(`\n✨ Task completed successfully!`);
          console.log(`   Captures: ${finalState.captures.length}`);
          console.log(`   Duration: ${Date.now() - (finalState.start_time || Date.now())}ms\n`);
        } else {
          failed++;
          console.log(`\n❌ Task failed: ${finalState.error}\n`);
        }
      } catch (error) {
        failed++;
        console.error(`\n❌ Task error: ${error}\n`);
      }

      // Wait between tasks
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Final Results:`);
  console.log(`   ✅ Completed: ${completed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Results saved to: ./runs/`);
  console.log(`${"=".repeat(60)}\n`);
  
  // Force exit to ensure all browsers are closed
  process.exit(0);
}

runAllTasks().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


