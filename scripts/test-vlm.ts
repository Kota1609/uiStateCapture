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
  
  // Just run the first task (create_issue)
  const task = tasks[0];

  console.log(`\n🧪 Testing VLM with task: ${task.task_name}\n`);

  const runId = "vlm-test-" + Date.now();
  const browser = await chromium.launch({ headless: false });
  const graph = new CaptureGraph(task.app, task.task_id, task, runId);

  const result = await graph.run();
  await browser.close();

  console.log(`\n✅ Completed! Captured ${result.captures.length} screenshots`);
  console.log(`📁 Check: ./runs/linear_${runId}/create_issue/\n`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

