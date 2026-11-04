# PulseTask — Clean, Fast, Intuitive Task Manager

A production-ready, lightning-fast task management web application inspired by Todoist and Things 3. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, and native SQLite with zero external database dependencies.

ZenTask features full first-class bilingual support for **English (LTR)** and **Persian / فارسی (RTL)** with the **Vazirmatn** typography and mathematical Gregorian <-> Jalali (Shamsi) calendar conversion.

---

## ✨ Features

- **No Clutter, Single-Layer Architecture**: Streamlined to deliver pure speed and zero distraction.
- **Natural Language Parsing (NLP)**: Type tasks like `"Deliver client prototype tomorrow at 4pm p1"` or `"جلسه هماهنگی تیم فردا ساعت ۱۶ p1"` to automatically set due date, time, and priority.
- **Bilingual & Dynamic RTL/LTR**: One-click language switch between English and Persian. Automatically mirrors the entire layout and typography.
- **Interactive Jalali & Gregorian Calendar (`/app/upcoming`)**:
  - Displays full monthly calendar grid.
  - Automatically renders Persian month names (`فروردین` ... `اسفند`), Persian digits, and Saturday-first weeks when in Persian mode.
  - Displays tasks scheduled on each date with click-to-view and click-to-schedule.
- **Pomodoro Focus Mode (`/app/focus`)**:
  - 25-minute deep focus interval & 5-minute break timer.
  - Link any pending task directly to your session.
  - Audio chime synthesizer & native browser notifications upon completion.
  - Tracks and stores completed focus sessions in SQLite.
- **Satisfying Micro-Interactions**:
  - Checkbox completion animation with celebratory confetti bursts (`canvas-confetti`).
  - Drag-and-drop task reordering with persistent database order indices.
- **Subtasks & Notes**:
  - Add checklists and markdown descriptions to tasks.
  - Supports recurring task automation (Daily, Weekly, Monthly).
- **Global Keyboard Shortcuts**:
  - `Q`: Open Quick Add from anywhere.
  - `Ctrl + K` / `Cmd + K`: Open Command Palette search & shortcuts.
  - `Esc`: Close open modals.
- **PWA Ready**: Includes `manifest.json` and theme tokens for mobile home screen installation.
- **Real SQLite Persistence**: Runs locally at `./data/zentask.db` with WAL mode and multi-worker safety. Survives reloads and restarts.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 24 recommended)
- npm or pnpm

### 2. Installation
```bash
git clone <repo-url> pulsetask
cd pulsetask
npm install
```

### 3. Environment Variables
Create a `.env` file (or copy `.env.example`):
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Routes & Features

| Route | Description |
|---|---|
| `/` | Landing page with Framer Motion animations, interactive task preview, pricing, and FAQ. |
| `/login` | Auth sign-in with 1-click test sign-in (`alex@zentask.com` / `zentask123`). |
| `/signup` | Create a new user account. |
| `/app/today` | Tasks scheduled for today with Shamsi/Gregorian formatted header date. |
| `/app/inbox` | All unassigned tasks with drag & drop reordering. |
| `/app/upcoming` | Monthly calendar grid with Jalali/Gregorian toggle and date-specific task previews. |
| `/app/projects/[id]` | Tasks grouped by specific custom projects (`Personal Life`, `Work & Deliverables`). |
| `/app/focus` | 25-minute Pomodoro timer with task linkage and desktop notifications. |
| `/app/settings` | Language toggle (English LTR / فارسی RTL), theme toggle (Light / Dark / System), and notifications toggle. |

---

## ⌨️ Keyboard Shortcuts

- `Q` — Quick Add task from any page.
- `Ctrl + K` or `Cmd + K` — Search tasks and navigate pages.
- `Esc` — Close dialogs and modals.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Logical RTL properties
- **Fonts**: Plus Jakarta Sans (English) + Vazirmatn (Persian)
- **Animations**: Framer Motion
- **Database**: Native Node `node:sqlite` (SQLite with WAL mode)
- **State & i18n**: React Context with dynamic language & theme providers
