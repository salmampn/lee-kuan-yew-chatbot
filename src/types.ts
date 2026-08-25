export interface SourceDocument {
  id: string;
  name: string;
  title: string;
  year?: string;
  category: 'speech' | 'interview' | 'article' | 'memoir' | 'user_upload';
  content: string;
  chunks: DocumentChunk[];
  sizeBytes: number;
  uploadedAt: number;
  enabled: boolean;
  sourceCitation?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  documentTitle: string;
  chunkIndex: number;
  pageOrSection?: string;
  text: string;
  tokenCount?: number;
}

export interface RetrievedSource {
  chunkId: string;
  documentId: string;
  documentName: string;
  documentTitle: string;
  pageOrSection?: string;
  excerpt: string;
  relevanceScore: number;
  matchedKeywords: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sourcesUsed?: RetrievedSource[];
  retrievedContext?: RetrievedSource[];
  isModernOrHypothetical?: boolean;
  evidenceScore?: number;
  hasInsufficientEvidence?: boolean;
  queryTimeMs?: number;
}

export interface RAGQueryPayload {
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  chunks: DocumentChunk[];
  evidenceMode?: boolean;
}

export interface RAGQueryResponse {
  answer: string;
  sourcesUsed: RetrievedSource[];
  allRetrievedEvidence: RetrievedSource[];
  isModernOrHypothetical: boolean;
  hasInsufficientEvidence: boolean;
}
