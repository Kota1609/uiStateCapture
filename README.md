Here's a comprehensive README for your GitHub repo:

```markdown
# Softlight - AI-Powered UI State Capture System

**An intelligent multi-agent system that automatically captures UI states (including non-URL states like modals, forms, and dropdowns) for training AI agents.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green)](https://playwright.dev/)
[![Groq Vision](https://img.shields.io/badge/Groq-Llama%204%20Scout-orange)](https://groq.com/)

---

## 🎯 Problem Statement

AI agents need training data that captures **complete UI workflows** - not just pages with URLs, but also:
- Modal dialogs (no URL)
- Form states (no URL)
- Dropdown menus (no URL)
- Toast notifications (no URL)
- Loading states (no URL)

**Softlight** solves this by autonomously navigating web apps and intelligently detecting when to capture UI states.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/softlight.git
cd softlight

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Run authentication setup (Linear & Notion)
npm run setup-auth

# Capture all tasks (Linear + Notion)
npm run capture-all
```

### Available Commands

```bash
npm run capture-all      # Run all Linear & Notion tasks
npm run capture-linear   # Run only Linear tasks
npm run capture-notion   # Run only Notion tasks
npm run dev             # Start development server
```

---

## 📊 Captured Tasks

### Linear (5 tasks)
1. **Create Issue** - Opens modal, fills form, submits
2. **Change Status + Priority** - Todo → In Progress, set High priority
3. **Filter by Priority** - Filter issues by High priority
4. **View Projects** - Navigate and open project details
5. **View Settings** - Access team settings page

### Notion (5 tasks)
1. **View Database** - Load Stock Market Tracker database
2. **Switch Views** - Toggle between Table/Board/Performance views
3. **Create Entry** - Add new database entry via side panel
4. **Search Database** - Use Cmd+F to search for "Apple"
5. **View Entry Details** - Open and view database entry

---

## 🏗️ Architecture

```
┌─────────────┐
│  Navigator  │ ──> Executes browser actions (click, fill, press, navigate)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Detector   │ ──> Runs 4 detectors after each action:
└──────┬──────┘     • ModalDetector (dialog boxes)
       │            • ToastDetector (notifications)
       │            • FormDetector (input fields)
       │            • QuietWindowDetector (stable states)
       ▼
┌─────────────┐
│  Perceptor  │ ──> VLM (Groq Llama 4 Scout) verifies ambiguous states
└──────┬──────┘     Returns: caption, reasoning, confidence
       │
       ▼
┌─────────────┐
│  Streamer   │ ──> Saves screenshot + metadata JSON to disk
└─────────────┘
```

### Key Features

✅ **Intelligent State Detection**
- Automatic detection of modals, toasts, forms, and stable states
- VLM verification for ambiguous states
- Confidence scoring for each capture

✅ **Vision Language Model Integration**
- Uses Groq's Llama 4 Scout Vision (10x faster than GPT-4V)
- Generates human-readable captions for every UI state
- Provides reasoning for each capture decision

✅ **Rich Metadata**
- Accessibility information (focused elements, interactive elements)
- DOM snapshots (visible fields, modal titles)
- Network context (idle duration, pending requests)
- Full VLM analysis (caption, reasoning, confidence)

✅ **Keyboard-First Navigation**
- Uses app-specific shortcuts (Cmd+Enter, 'C', 'S', 'F', etc.)
- More reliable than CSS selectors
- Matches real user workflows

---

## 📁 Dataset Structure

```
runs/
├── linear_2025-10-31_02-16-05/
│   ├── create_issue/
│   │   ├── 000.png              # Initial page
│   │   ├── 000.json             # Metadata with VLM analysis
│   │   ├── 001.png              # Modal opened
│   │   ├── 001.json
│   │   ├── 002.png              # Form filled
│   │   ├── 002.json
│   │   └── 003.png              # Issue created (success state)
│   ├── change_issue_status/
│   ├── filter_issues/
│   └── ...
└── notion_2025-10-31_02-16-05/
    ├── view_database/
    ├── switch_views/
    └── ...
```

### Metadata JSON Example

```json
{
  "state_id": "001",
  "task_id": "create_issue",
  "app": "linear",
  "timestamp": "2025-10-31T02:08:18.660Z",
  "url": "https://linear.app/test-softlight/team/TES/active",
  "capture_reason": {
    "trigger": "detector",
    "detector_type": "modal_visible",
    "confidence": 1.0
  },
  "verification": {
    "vlm_verified": true,
    "vlm_confidence": 0.95,
    "caption": "A modal dialog for creating a new issue is visible.",
    "reasoning": "The image shows a white modal dialog box with fields for 'Issue title' and 'Add description...'. There are also buttons for 'Todo', 'Priority', 'Assignee', 'Project', and 'Create issue'. The presence of this dialog box indicates that it is a modal dialog for creating a new issue.",
    "verified_at": "2025-10-31T02:08:18.661Z"
  },
  "accessibility": {
    "interactive_elements": 75,
    "focused_element": "textbox"
  },
  "dom_snapshot": {
    "visible_fields": ["Issue title", "Issue description"],
    "submit_enabled": true
  }
}
```

---

## 🔧 Tech Stack

- **TypeScript** - Type-safe browser automation
- **Playwright** - Cross-browser automation
- **Groq API** - Llama 4 Scout Vision (VLM)
- **Zod** - Runtime type validation
- **Sharp** - Image optimization
- **Fastify** - SSE server (future: real-time streaming)
- **Pino** - Structured logging

---

## 🎬 Demo Video

[Loom Video]([https://your-loom-link-here](https://www.loom.com/share/a380f713a02a4e01bac91050e61576b0)) - https://www.loom.com/share/a380f713a02a4e01bac91050e61576b0


## 📈 Results

- ✅ **10 tasks completed** across Linear & Notion
- 📸 **35 UI states captured** (avg 3.5 per task)
- 🤖 **100% VLM coverage** - every capture analyzed
- ⚡ **~2 seconds per capture** (Groq is 10x faster than GPT-4V)
- 💾 **~60KB per screenshot** (compressed)

---

## 🔮 Future Enhancements

- [ ] Real-time SSE streaming to Agent A
- [ ] Image redaction for sensitive data (PII, tokens)
- [ ] Support for more apps (Asana, Jira, GitHub)
- [ ] Adaptive detector thresholds based on app
- [ ] Multi-browser support (Chrome, Firefox, Safari)
