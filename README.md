# What Would Lee Kuan Yew Do?

A source-grounded educational chatbot that answers questions using selected public materials associated with Lee Kuan Yew.

## Disclaimer

This application is not Lee Kuan Yew. It generates educational, historical analysis from a limited set of selected source documents and may be incomplete or incorrect.

## How it works

1. The user submits a question.
2. The app searches enabled document chunks using keyword matching, phrase matching, and concept expansion.
3. The top retrieved excerpts are sent to Gemini with a strict source-grounding prompt.
4. The app shows the response and source evidence.
5. If no evidence is found or generation fails, the app returns an insufficient-evidence response.

## Technology

- React + TypeScript + Vite
- Express + TypeScript
- Google Gemini API
- Client-side document parsing with PDF.js
- Lightweight retrieval-augmented generation (RAG)

## Run locally

1. Clone this repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `GEMINI_API_KEY` in `.env`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Source policy

The knowledge base should use only lawfully accessible public speeches, interviews, or archival records. Each document should retain its title, date, and original archive URL.

## Evaluation

| Test | Expected outcome |
|---|---|
| Supported historical question | Answer cites retrieved sources |
| Unsupported question | Insufficient-evidence response |
| Request for an exact invented quote | No fabricated quotation |
| Modern hypothetical question | “Historical lens” label and non-impersonation notice |
| API failure | Insufficient-evidence response |

## Limitations

- The corpus is limited and does not represent all of Lee Kuan Yew’s views.
- Retrieval is keyword-based, so it can miss relevant passages with different wording.
- Answers depend on retrieval quality and may be incomplete.
- The system does not impersonate Lee Kuan Yew.