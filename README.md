# ClipPilot AI

> **Describe it. Edit it. Own the result.**

ClipPilot AI is an AI-assisted video editing workspace that enables users to perform complex video editing operations, timeline manipulations, and media processing using natural language instructions paired with a browser-native WebGL2 video editor.

---

## Architecture & Monorepo Structure

ClipPilot AI is organized as a clean monorepo:

```text
c:\Users\pc\Desktop\MLH\
├── apps/
│   ├── web/                     # Frontend: React 19 + TypeScript + Vite + Elah Video Editor
│   │   └── src/
│   │       ├── components/
│   │       │   ├── editor/      # VideoEditorWorkspace, AIAssistantPanel, ExportModal
│   │       │   └── layout/      # Header navigation bar
│   │       └── main.tsx
│   └── api/                     # Backend: FastAPI + Python + Pydantic Settings
│       ├── app/
│       │   ├── api/routes/      # GET /health, POST /api/v1/chat/plan
│       │   ├── core/            # Pydantic settings & CORS configuration
│       │   └── llm/             # LLM provider integration & response contracts
│       ├── tests/               # Pytest suite
│       └── pyproject.toml
├── packages/
│   └── shared/                  # Shared contract placeholders
├── docs/                        # Architecture & API contract documentation
└── .env.example                 # Environment configuration template
```

---

## Features Implemented

1. **Browser-Native Video Editor Workspace**: Integrated Elah Video Editor SDK (`@elah/editor` v0.6.0) providing a frame-accurate WebGL2 video preview container and multi-track timeline.
2. **Local Media Import**: Drag-and-drop / file selector media import supporting local video, audio, and image assets via browser WebCodecs/demuxer.
3. **Structured AI Assistant Workflow**: Natural language prompt input connected to the backend planning service implementing the safe workflow:
   $$\text{User Request} \rightarrow \text{Structured Plan Proposal} \rightarrow \text{User Approval} \rightarrow \text{Timeline Execution}$$
4. **In-Browser MP4 Export**: Client-side video rendering using Web Workers (`exportVideo`), providing real-time percentage progress bars and MP4 file downloads.
5. **FastAPI Service & Safe LLM Layer**: Python FastAPI backend with configurable CORS, Pydantic Settings, Pydantic response contracts (`EditingPlanProposal`), `/health` endpoint, and pytest verification.

---

## Technology Stack

- **Frontend**: React 19, TypeScript 6.0, Vite 8.3, `@elah/editor` (v0.6.0), `@elah/core` (v0.6.0), Lucide React.
- **Backend**: Python 3.14 / 3.11+, FastAPI, Uvicorn, Pydantic 2.13, Pydantic Settings, HTTPX, Pytest 9.1.
- **AI / LLM Integration**: Pydantic schema validation for untrusted model proposals; support for OpenAI / local HTTP model providers.

---

## Environment Variables

Copy `.env.example` to `.env` or set environment variables:

### Backend (`apps/api/.env.example`)
```env
PROJECT_NAME="ClipPilot AI API"
VERSION="0.1.0"
ENVIRONMENT="development"
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
PORT=8000
HOST="0.0.0.0"

# LLM Configuration (Optional)
LLM_PROVIDER=openai
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4o
LLM_TIMEOUT=30.0
```

---

## Quick Start & Local Run Instructions

### 1. Frontend Development (`apps/web`)

```bash
# Run frontend dev server
npm run dev --workspace=@clippilot/web

# Build frontend production bundle
npm run build --workspace=@clippilot/web
```

### 2. Backend Development (`apps/api`)

```bash
cd apps/api

# Run FastAPI backend with Uvicorn
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## Running Tests & Verifications

```bash
# Frontend build & TypeScript typecheck
npm run build --workspace=@clippilot/web

# Backend Pytest suite
cd apps/api
.venv\Scripts\pytest
```

---

## Known Limitations

- In-browser WebGL2 rendering relies on client browser WebCodecs API support; extremely large 4K source videos are constrained by browser memory limits.
- Model proposals require explicit user approval before execution on the timeline.
