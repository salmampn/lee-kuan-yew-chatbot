import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));

  // Health check API
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      time: new Date().toISOString(),
    });
  });

  // Chat RAG API Endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const {
        question,
        history = [],
        retrievedContext = [],
        isModernOrHypothetical = false,
      } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required.' });
      }

      // Check if any retrieved context exists
      if (!retrievedContext || retrievedContext.length === 0) {
        return res.json({
          answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
          sourcesUsed: [],
          isModernOrHypothetical,
          hasInsufficientEvidence: true,
        });
      }

      const client = getAIClient();

      // Format retrieved documents into context block
      const contextBlocks = retrievedContext.map((c: any, index: number) => {
        return `--- [SOURCE ${index + 1}] ---
Document: ${c.documentName} ("${c.documentTitle}")
Section/Reference: ${c.pageOrSection || 'General'}
Excerpt: ${c.excerpt}
`;
      }).join('\n\n');

      const systemInstruction = `You are an educational AI assistant for the application "What Would Lee Kuan Yew Do?".
You analyze questions on leadership, governance, geopolitics, economics, education, and life based strictly on the provided knowledge base of Lee Kuan Yew's public materials.

CRITICAL BEHAVIORAL CONSTRAINTS:
1. NEVER say or imply that you are Lee Kuan Yew. Speak as an objective, analytical educational analyst.
2. NEVER invent quotes, citations, or historical positions not grounded in the provided sources.
3. Use ONLY the provided retrieved source excerpts to substantiate claims about Lee Kuan Yew's philosophy, policies, or statements.
4. If the provided source excerpts do not contain sufficient evidence to address the query reliably, you MUST output EXACTLY:
"I do not have sufficient evidence in the available sources to answer that reliably."
5. For questions about modern events, contemporary technologies, or hypothetical scenarios (where isModernOrHypothetical is true or the user asks what he would do in modern times):
   - You MUST include a distinct markdown heading: "### Historical lens"
   - You MUST explicitly clarify in the opening sentence that the analysis is an analytical inference derived from his core historical principles (such as pragmatism, meritocracy, deterrence, zero tolerance for corruption, or small-state survival), and is NOT a real statement made by Lee Kuan Yew.
6. Keep answers CONCISE, analytical, and structured: strictly between 150 and 250 words.
7. Maintain a pragmatic, direct, rigorous, historically grounded tone without impersonating him.
8. At the end of key factual statements or arguments, refer to the source document by name or bracket number (e.g. [Source 1], [Source 2]).`;

      const promptText = `USER QUESTION:
${question}

RETRIEVED KNOWLEDGE BASE EXCERPTS:
${contextBlocks}

IS MODERN / HYPOTHETICAL QUESTION:
${isModernOrHypothetical ? 'YES. Remember to use "### Historical lens" heading and state clearly that this is an analytical inference from historical principles.' : 'NO. Base statements strictly on historical facts in the sources.'}

RECENT CONVERSATION HISTORY:
${history.slice(-3).map((h: any) => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

Now provide a precise, 150-250 word response strictly following all rules.`;

      // if (!client) {
      //   // Fallback generator when API key is not configured or in offline sandbox mode
      //   // Synthesizes grounded answer directly from the retrieved context
      //   const synthesized = generateFallbackRAGAnswer(question, retrievedContext, isModernOrHypothetical);
      //   return res.json({
      //     answer: synthesized.answer,
      //     sourcesUsed: retrievedContext.slice(0, 3),
      //     isModernOrHypothetical,
      //     hasInsufficientEvidence: synthesized.hasInsufficientEvidence,
      //   });
      // }

      if (!client) {
        return res.json({
          answer:
            'I do not have sufficient evidence in the available sources to answer that reliably.',
          sourcesUsed: [],
          isModernOrHypothetical,
          hasInsufficientEvidence: true,
        });
      }

      const serverStart = Date.now();

      // Call Gemini API with fast candidate switching (no blocking sleep delays)
      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.7-flash',
      ];

      let response: any = null;
      let lastErr: any = null;

      for (const modelName of candidateModels) {
        try {
          response = await client.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              systemInstruction,
              temperature: 0.15, // Low temperature for high factual accuracy and swift output
              maxOutputTokens: 450,
            },
          });
          if (response) {
            break;
          }
        } catch (err: any) {
          lastErr = err;
          // Quickly try next candidate without artificial delay
          continue;
        }
      }

      if (!response) {
        throw lastErr || new Error('All model candidates failed.');
      }

      const responseText = response.text ? response.text.trim() : '';

      if (!responseText) {
        return res.json({
          answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
          sourcesUsed: [],
          isModernOrHypothetical,
          hasInsufficientEvidence: true,
          latencyMs: Date.now() - serverStart,
        });
      }

      const hasInsufficient = responseText.includes('I do not have sufficient evidence in the available sources to answer that reliably.');

      return res.json({
        answer: responseText,
        sourcesUsed: hasInsufficient ? [] : retrievedContext.slice(0, 3),
        isModernOrHypothetical,
        hasInsufficientEvidence: hasInsufficient,
        latencyMs: Date.now() - serverStart,
      });
    } catch (error: any) {
      console.error('Error in /api/chat handler:', error);
      // Return a grounded insufficient evidence response instead of crashing with 500
      return res.json({
        answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
        sourcesUsed: [],
        isModernOrHypothetical: req.body?.isModernOrHypothetical ?? false,
        hasInsufficientEvidence: true,
      });
    }
  });

  // Vite development middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`What Would Lee Kuan Yew Do? server running on port ${PORT}`);
  });
}

// function generateFallbackRAGAnswer(
//   question: string,
//   sources: any[],
//   isModern: boolean
// ): { answer: string; hasInsufficientEvidence: boolean } {
//   if (!sources || sources.length === 0) {
//     return {
//       answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
//       hasInsufficientEvidence: true,
//     };
//   }

//   const primary = sources[0];
//   const secondary = sources[1] || primary;

//   let body = '';
//   if (isModern) {
//     body = `### Historical lens\n\nThis analysis is an inference from Lee Kuan Yew's historical writings and core governance principles, not a direct statement made by him regarding modern circumstances.\n\nHistorically, his approach to structural disruption and statecraft was defined by ruthless pragmatism and adaptability (*${primary.documentTitle}*). Rather than adhering to dogmatic doctrines, policy was evaluated solely by measurable outcomes: does it strengthen national resilience, preserve institutional integrity, and create sustainable livelihoods?\n\nIn addressing modern dilemmas, his historical framework emphasized three non-negotiables: investing aggressively in talent and technical capabilities, preserving uncompromising standards against corruption, and maintaining strategic autonomy through international relevance. As documented in *${secondary.documentName}*, small states survive not through moralizing, but by anticipating global shifts faster than their competitors.`;
//   } else {
//     body = `Based on the archived source materials, Lee Kuan Yew's position was rooted in empirical pragmatism and institutional discipline.\n\nIn *${primary.documentTitle}* (${primary.pageOrSection || 'Source Reference'}), he emphasized that a small nation without natural resources possesses only one enduring asset: the intelligence, discipline, and integrity of its people. Meritocracy and absolute zero-tolerance for corruption were treated not as philosophical ideals, but as existential survival mechanisms.\n\nFurthermore, as highlighted in *${secondary.documentName}*, long-term national viability requires leaders who are prepared to make difficult, unpopular decisions today to guarantee stability and security decades ahead. Public trust is earned through competence and concrete execution rather than populist rhetoric.`;
//   }

//   return {
//     answer: body,
//     hasInsufficientEvidence: false,
//   };
// }

startServer();
