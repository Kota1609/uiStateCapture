import { config } from "dotenv";
import { LinearAdapter } from "../packages/backend/src/adapters/linear.js";
import { CaptureGraph } from "../packages/backend/src/graph/graph.js";
import { chromium } from "playwright";

config();

async function main() {
  const workspace = process.env.LINEAR_WORKSPACE;
  if (!workspace) {
    throw new Error("LINEAR_WORKSPACE not set in .env");
  }

  const adapter = new LinearAdapter(workspace);
  const tasks = adapter.getTasks();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Running ${tasks.length} LINEAR Tasks`);
  console.log(`${"=".repeat(60)}\n`);

  // ONE run ID for ALL Linear tasks in this execution
  const runId = new Date().toISOString().replace(/[:.]/g, "-").split("T").join("_").slice(0, 19);
  console.log(`🆔 Run ID: ${runId}\n`);

  let completed = 0;
  let failed = 0;

  for (const task of tasks) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`📋 Task: ${task.task_name} (${task.task_id})`);
    console.log(`${"─".repeat(60)}`);

    try {
      const browser = await chromium.launch({ headless: false });
      const graph = new CaptureGraph(task.app, task.task_id, task, runId);

      const result = await graph.run();

      await browser.close();

      if (result.status === "completed") {
        console.log(`✅ Task completed! Captured ${result.captures.length} screenshots`);
        completed++;
      } else {
        console.log(`❌ Task failed with status: ${result.status}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        failed++;
      }
    } catch (error: any) {
      console.error(`❌ Task failed with error: ${error.message}`);
      failed++;
    }
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

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

