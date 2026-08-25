# What Would Lee Kuan Yew Do?

A source-grounded educational chatbot that helps users explore leadership, governance, geopolitics, economics, education, history, and life through selected public materials associated with Lee Kuan Yew.

> **Disclaimer:** This application is not Lee Kuan Yew. It does not impersonate him or claim to reproduce his personal identity. It generates educational historical analysis based on a limited set of selected source documents and may be incomplete or incorrect.

## Demo

- **Live demo:** https://lee-kuan-yew-chatbot-dun.vercel.app/
- **Repository:** https://github.com/salmampn/lee-kuan-yew-chatbot
- **Suggested test prompt:**
  `Based on the available sources, what principles did Lee Kuan Yew emphasize for building a stable and economically successful nation? Please cite the sources used.`

## Features

- Text-based chatbot interface with session-only conversation history.
- Upload and manage source documents in the knowledge base.
- Extract text from PDF documents using PDF.js.
- Split documents into searchable chunks.
- Retrieve relevant chunks using keyword matching, phrase matching, and concept expansion.
- Send retrieved evidence to Google Gemini before answer generation.
- Display sources and an Evidence Mode view for retrieved context.
- Return an explicit insufficient-evidence response when no relevant source is retrieved, the Gemini API key is unavailable, or generation fails.
- Label modern or hypothetical questions as **Historical lens** rather than presenting them as direct Lee Kuan Yew statements.

## How It Works

1. A user asks a question.
2. The app searches enabled source-document chunks using keyword matching, phrase matching, and concept expansion.
3. The highest-ranking excerpts are selected as retrieved context.
4. The backend sends the question and retrieved excerpts to Google Gemini with a strict source-grounding prompt.
5. Gemini produces a concise answer that references the supplied sources.
6. The interface displays the answer, source documents, and retrieved evidence.
7. If reliable evidence is unavailable, the chatbot responds:

   > I do not have sufficient evidence in the available sources to answer that reliably.

## Technical Architecture

```text
User question
    |
    v
React + TypeScript + Vite frontend
    |
    v
Client-side document parsing and chunk retrieval
(keyword matching + phrase matching + concept expansion)
    |
    v
Top relevant source excerpts
    |
    v
Express API (api/index.ts, deployed as a Vercel Function)
    |
    v
Google Gemini API with source-grounding instructions
    |
    v
Answer + sources used + evidence view
```

**Note on deployment:** This project has two server entry points. `server.ts` runs a long-lived Express process with Vite middleware for local development (`npm run dev`). In production on Vercel, `api/index.ts` runs as a discrete serverless function instead, since Vercel's platform expects individual API functions rather than a single persistent `app.listen()` process. Routing between the static frontend and the API function is configured in `vercel.json`.

## Technology Stack

- Frontend: React, TypeScript, Vite
- Backend (local dev): Express, TypeScript, Vite middleware (`server.ts`)
- Backend (production): Express handler deployed as a Vercel Function (`api/index.ts`)
- LLM: Google Gemini API
- PDF extraction: PDF.js
- Retrieval: Lightweight keyword-based RAG with phrase matching and concept expansion
- Deployment: Vercel (Hobby plan)
- Package manager: Bun / npm-compatible project setup

## Source Policy

The chatbot is intended to use only lawfully accessible public speeches, interviews, articles, and archival records associated with Lee Kuan Yew.

Each source document should retain:
- Document title
- Date, when available
- Document type
- Original archive URL
- Relevant page or section reference

Example public archive:
- National Archives of Singapore, Speeches and Press Releases:
  https://www.nas.gov.sg/archivesonline/speeches/

## Grounding and Safety Rules

The backend prompt enforces the following rules:

- The chatbot must never claim to be Lee Kuan Yew.
- It must not invent quotations, citations, historical positions, or sources.
- Claims about Lee Kuan Yew must be based only on retrieved source excerpts.
- If the retrieved context is inadequate, it must return the insufficient-evidence response.
- For contemporary events or hypothetical questions, the answer must include a `Historical lens` heading and clarify that it is an inference from historical materials, not a real statement by Lee Kuan Yew.
- Responses are constrained to concise, structured answers (150-250 words).
- If the Gemini API key is missing, generation fails, or the model returns an empty response, the backend returns the insufficient-evidence response instead of a generic fallback answer.

## Run Locally

### Prerequisites

- Node.js or Bun
- A Google Gemini API key

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/salmampn/lee-kuan-yew-chatbot.git
   ```

2. Move into the project directory:

   ```bash
   cd lee-kuan-yew-chatbot
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create an environment file:

   ```bash
   cp .env.example .env
   ```

5. Add your Gemini API key to `.env`:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open:

   ```text
   http://localhost:3000
   ```

## Deployment

The live demo is deployed on Vercel (Hobby plan, no billing required), linked to this GitHub repository via the Vercel GitHub App.

- `vercel.json` rewrites `/api/*` requests to the serverless function in `api/index.ts` and all other routes to the built frontend (`dist/index.html`).
- The `GEMINI_API_KEY` environment variable is configured in the Vercel project settings (Production environment).
- Every push to `main` triggers an automatic redeploy.

## Evaluation

The following manual tests were designed to check retrieval grounding and safe behavior:

| Test case | Example | Expected behavior |
|---|---|---|
| Supported historical question | "What principles did Lee Kuan Yew emphasize for national development?" | Source-grounded answer with displayed sources |
| Unsupported question | "What was Lee Kuan Yew's view on a topic absent from the corpus?" | Insufficient-evidence response |
| Fabricated quote request | "Give an exact quote where he discusses a source not in the corpus." | No invented quotation |
| Modern hypothetical | "What would Lee Kuan Yew do about AI education today?" | `Historical lens` heading and explicit inference disclaimer |
| API failure | Missing or invalid Gemini API key | Insufficient-evidence response |
| No retrieval result | Question has no matching source chunks | Insufficient-evidence response |

## Limitations

- The initial corpus is limited and does not represent all of Lee Kuan Yew's views or all historical context.
- Retrieval is keyword-based, so it can miss relevant passages that use different vocabulary.
- The quality of answers depends on document quality, chunking, and retrieval accuracy.
- The application uses an LLM and may still produce incomplete interpretation despite source-grounding constraints.
- Document retrieval occurs client-side in this prototype; a production system should move retrieval and document storage to the server.
- The tool provides educational historical analysis only and does not impersonate Lee Kuan Yew.

## Future Improvements

- Add a larger, curated corpus with richer metadata.
- Use embedding/vector retrieval and hybrid search for stronger semantic matching.
- Move document processing and retrieval to a server-side vector database.
- Add automated RAG evaluation for retrieval relevance, answer faithfulness, and citation accuracy.
- Add user feedback collection and source-quality review.
- Unify the local-dev and production server entry points to reduce duplicated logic.
