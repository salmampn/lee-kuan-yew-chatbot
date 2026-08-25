import { DocumentChunk, RetrievedSource } from '../types';

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you',
  'your', 'yours', 'yourself', 'yourselves', 'tell', 'explain', 'think', 'thought', 'view', 'views',
  'said', 'stated', 'ask', 'question'
]);

// Concept expansion dictionary for historical Singapore & Lee Kuan Yew political terminology
const CONCEPT_EXPANSIONS: Record<string, string[]> = {
  'corruption': ['graft', 'integrity', 'clean', 'honest', 'bribes', 'cpib', 'standards', 'patronage', 'scrupulously'],
  'integrity': ['corruption', 'graft', 'clean', 'honest', 'reputation', 'morals', 'standards'],
  'leadership': ['statesmanship', 'discipline', 'decisiveness', 'courage', 'unpopular', 'conviction', 'credibility'],
  'meritocracy': ['talent', 'competence', 'scholarships', 'recruitment', 'civil service', 'remuneration', 'ability'],
  'geopolitics': ['superpowers', 'balance of power', 'china', 'united states', 'asean', 'small state', 'sovereignty', 'regional'],
  'china': ['beijing', 'rising power', 'east asia', 'superpower', 'chinese', 'asian'],
  'us': ['united states', 'america', 'washington', 'pacific', 'balancer'],
  'america': ['united states', 'us', 'washington', 'balancer', 'presence'],
  'economy': ['fdi', 'multinational', 'investors', 'infrastructure', 'jobs', 'productivity', 'trade', 'pragmatism'],
  'pragmatism': ['practical', 'dogma', 'ideology', 'results', 'capitalist', 'socialist', 'experiment'],
  'housing': ['hdb', 'home ownership', 'cpf', 'stake', 'flats', 'property'],
  'welfare': ['subsidies', 'dependency', 'trampoline', 'hammock', 'entitlement', 'workfare', 'cpf'],
  'multiracial': ['racial harmony', 'ethnic', 'communal', 'malay', 'chinese', 'indian', 'integration'],
  'race': ['multiracial', 'racial', 'communal', 'harmony', 'ethnic', 'equality'],
  'language': ['bilingualism', 'english', 'mother tongue', 'commerce', 'heritage', 'culture'],
  'bilingualism': ['language', 'english', 'mother tongue', 'culture', 'communication'],
  'survival': ['rugged', 'small island', 'vulnerable', 'discipline', 'hard work', 'defend'],
  'demographics': ['fertility', 'birth rate', 'aging', 'immigration', 'population', 'talent'],
  'defense': ['deterrence', 'military', 'national service', 'security', 'stability'],
  'trust': ['cohesion', 'credibility', 'delivery', 'confidence', 'social compact'],
};

// Keywords indicating modern / hypothetical / future scenarios
const MODERN_KEYWORDS = [
  'ai', 'artificial intelligence', 'chatgpt', 'llm', 'machine learning',
  'cryptocurrency', 'crypto', 'bitcoin', 'blockchain',
  'social media', 'tiktok', 'twitter', 'facebook', 'instagram', 'youtube',
  'climate change', 'global warming', 'green transition', 'carbon tax', 'esg',
  'covid', 'pandemic', 'mrna',
  'russia-ukraine', 'ukraine war', 'putin', 'taiwan 202', 'gaza', 'israel-hamas',
  'hypothetical', 'what if', 'today', 'modern', '2024', '2025', '2026', 'future'
];

export function isModernOrHypotheticalQuery(query: string): boolean {
  const normalized = query.toLowerCase();
  for (const keyword of MODERN_KEYWORDS) {
    // Word boundary check or substring for phrases
    const regex = new RegExp(`\\b${keyword.replace('-', '\\-')}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(keyword)) {
      return true;
    }
  }
  if (normalized.includes('would he think of today') || 
      normalized.includes('what would') || 
      normalized.includes('how would') ||
      normalized.includes('current')) {
    return true;
  }
  return false;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

export function expandQueryTerms(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    if (CONCEPT_EXPANSIONS[token]) {
      for (const synonym of CONCEPT_EXPANSIONS[token]) {
        expanded.add(synonym.toLowerCase());
      }
    }
  }
  return Array.from(expanded);
}

export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 4
): { retrieved: RetrievedSource[]; maxScore: number } {
  const queryTokens = tokenize(query);
  const expandedQueryTerms = expandQueryTerms(queryTokens);

  if (chunks.length === 0 || expandedQueryTerms.length === 0) {
    return { retrieved: [], maxScore: 0 };
  }

  // Calculate term frequency in chunks
  const scoredChunks = chunks.map((chunk) => {
    const chunkTokens = tokenize(chunk.text + ' ' + chunk.documentTitle);
    const chunkTokenSet = new Set(chunkTokens);
    
    let exactScore = 0;
    let expandedScore = 0;
    const matchedWords: string[] = [];

    // Exact query token matching (higher weight)
    for (const qToken of queryTokens) {
      const occurrences = chunkTokens.filter((t) => t === qToken || t.startsWith(qToken) || qToken.startsWith(t)).length;
      if (occurrences > 0) {
        exactScore += Math.min(occurrences, 4) * 3.5;
        matchedWords.push(qToken);
      }
    }

    // Expanded / synonym token matching
    for (const expTerm of expandedQueryTerms) {
      if (!queryTokens.includes(expTerm)) {
        if (chunkTokenSet.has(expTerm)) {
          expandedScore += 1.8;
          matchedWords.push(expTerm);
        }
      }
    }

    // Phrase / bigram matching bonus
    const lowerText = chunk.text.toLowerCase();
    for (let i = 0; i < queryTokens.length - 1; i++) {
      const bigram = `${queryTokens[i]} ${queryTokens[i + 1]}`;
      if (lowerText.includes(bigram)) {
        exactScore += 4.0;
      }
    }

    // Length normalization
    const lengthNorm = Math.log10(chunk.text.length + 10);
    const rawScore = (exactScore + expandedScore) / Math.max(1, lengthNorm);

    // Normalize relevance score to 0..1 range approx
    const normalizedScore = Math.min(1, Math.round((rawScore / 12) * 100) / 100);

    // Generate concise highlight excerpt
    const excerpt = generateExcerpt(chunk.text, matchedWords);

    return {
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      documentTitle: chunk.documentTitle,
      pageOrSection: chunk.pageOrSection || `Paragraph ${chunk.chunkIndex + 1}`,
      excerpt,
      fullText: chunk.text,
      relevanceScore: normalizedScore,
      rawScore,
      matchedKeywords: Array.from(new Set(matchedWords)),
    };
  });

  // Sort descending by raw score
  scoredChunks.sort((a, b) => b.rawScore - a.rawScore);

  const maxScore = scoredChunks.length > 0 ? scoredChunks[0].rawScore : 0;
  
  // Filter topK with positive score
  const topResults = scoredChunks
    .filter((sc) => sc.rawScore > 1.2)
    .slice(0, topK)
    .map((sc) => ({
      chunkId: sc.chunkId,
      documentId: sc.documentId,
      documentName: sc.documentName,
      documentTitle: sc.documentTitle,
      pageOrSection: sc.pageOrSection,
      excerpt: sc.excerpt,
      relevanceScore: sc.relevanceScore,
      matchedKeywords: sc.matchedKeywords,
    }));

  return { retrieved: topResults, maxScore };
}

function generateExcerpt(fullText: string, matchedWords: string[], maxLength: number = 220): string {
  if (matchedWords.length === 0) {
    return fullText.slice(0, maxLength).trim() + (fullText.length > maxLength ? '...' : '');
  }

  // Find position of the first matched word
  const lowerText = fullText.toLowerCase();
  let firstIdx = -1;
  for (const word of matchedWords) {
    const idx = lowerText.indexOf(word);
    if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
      firstIdx = idx;
    }
  }

  if (firstIdx === -1) {
    return fullText.slice(0, maxLength).trim() + (fullText.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, firstIdx - 40);
  const end = Math.min(fullText.length, start + maxLength);
  let snippet = fullText.substring(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}

export async function parseUploadedFile(
  file: File
): Promise<{ text: string; title: string }> {
  const filename = file.name;
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  // Plain Text, Markdown, CSV, JSON
  if (['txt', 'md', 'markdown', 'csv', 'json', 'log', 'rtf'].includes(extension)) {
    const text = await file.text();
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    return { text, title };
  }

  // PDF handling
  if (extension === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Set worker source or disable worker for direct read in browser
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += `\n\n--- Page ${pageNum} ---\n\n` + pageText;
      }

      const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return { text: fullText.trim(), title };
    } catch (err) {
      console.warn('PDF parsing worker error, attempting fallback raw text read:', err);
      const rawText = await file.text();
      return {
        text: rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' '),
        title: filename.replace(/\.[^/.]+$/, ''),
      };
    }
  }

  // Fallback for doc/docx/other text files
  const text = await file.text();
  return {
    text: text.replace(/[^\x20-\x7E\n\r\t]/g, ' '),
    title: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
  };
}
