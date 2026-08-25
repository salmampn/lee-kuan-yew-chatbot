import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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

const app = express();
app.use(express.json({ limit: '20mb' }));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    time: new Date().toISOString(),
  });
});

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

    if (!retrievedContext || retrievedContext.length === 0) {
      return res.json({
        answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
        sourcesUsed: [],
        isModernOrHypothetical,
        hasInsufficientEvidence: true,
      });
    }

    const client = getAIClient();

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
5. For questions about modern events, contemporary technologies, or hypothetical scenarios:
   - You MUST include a distinct markdown heading: "### Historical lens"
   - You MUST explicitly clarify that the analysis is an analytical inference, NOT a real statement made by Lee Kuan Yew.
6. Keep answers CONCISE, analytical, and structured: strictly between 150 and 250 words.
7. Maintain a pragmatic, direct, rigorous, historically grounded tone without impersonating him.
8. At the end of key factual statements, refer to the source document by name or bracket number (e.g. [Source 1]).`;

    const promptText = `USER QUESTION:
${question}

RETRIEVED KNOWLEDGE BASE EXCERPTS:
${contextBlocks}

IS MODERN / HYPOTHETICAL QUESTION:
${isModernOrHypothetical ? 'YES.' : 'NO.'}

RECENT CONVERSATION HISTORY:
${history.slice(-3).map((h: any) => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

Now provide a precise, 150-250 word response strictly following all rules.`;

    if (!client) {
      return res.json({
        answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
        sourcesUsed: [],
        isModernOrHypothetical,
        hasInsufficientEvidence: true,
      });
    }

    const candidateModels = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'];
    let response: any = null;
    let lastErr: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await client.models.generateContent({
          model: modelName,
          contents: promptText,
          config: { systemInstruction, temperature: 0.15, maxOutputTokens: 450 },
        });
        if (response) break;
      } catch (err: any) {
        lastErr = err;
        continue;
      }
    }

    if (!response) throw lastErr || new Error('All model candidates failed.');

    const responseText = response.text ? response.text.trim() : '';

    if (!responseText) {
      return res.json({
        answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
        sourcesUsed: [],
        isModernOrHypothetical,
        hasInsufficientEvidence: true,
      });
    }

    const hasInsufficient = responseText.includes('I do not have sufficient evidence in the available sources to answer that reliably.');

    return res.json({
      answer: responseText,
      sourcesUsed: hasInsufficient ? [] : retrievedContext.slice(0, 3),
      isModernOrHypothetical,
      hasInsufficientEvidence: hasInsufficient,
    });
  } catch (error: any) {
    console.error('Error in /api/chat handler:', error);
    return res.json({
      answer: 'I do not have sufficient evidence in the available sources to answer that reliably.',
      sourcesUsed: [],
      isModernOrHypothetical: req.body?.isModernOrHypothetical ?? false,
      hasInsufficientEvidence: true,
    });
  }
});

export default app;