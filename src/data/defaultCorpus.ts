import { SourceDocument, DocumentChunk } from '../types';

export function chunkText(
  documentId: string,
  documentName: string,
  documentTitle: string,
  text: string,
  chunkSize: number = 700,
  overlap: number = 150
): DocumentChunk[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: DocumentChunk[] = [];
  let currentChunkText = '';
  let chunkIndex = 0;
  let sectionIndex = 1;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    if (currentChunkText.length + paragraph.length > chunkSize && currentChunkText.length > 200) {
      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        documentId,
        documentName,
        documentTitle,
        chunkIndex,
        pageOrSection: `Section ${sectionIndex}`,
        text: currentChunkText.trim(),
        tokenCount: Math.ceil(currentChunkText.length / 4),
      });
      chunkIndex++;
      sectionIndex++;
      
      // Overlap by taking the tail
      const words = currentChunkText.split(' ');
      const overlapWords = words.slice(Math.max(0, words.length - 25)).join(' ');
      currentChunkText = overlapWords + '\n\n' + paragraph;
    } else {
      if (currentChunkText) {
        currentChunkText += '\n\n' + paragraph;
      } else {
        currentChunkText = paragraph;
      }
    }
  }

  if (currentChunkText.trim().length > 0) {
    chunks.push({
      id: `${documentId}_chunk_${chunkIndex}`,
      documentId,
      documentName,
      documentTitle,
      chunkIndex,
      pageOrSection: `Section ${sectionIndex}`,
      text: currentChunkText.trim(),
      tokenCount: Math.ceil(currentChunkText.length / 4),
    });
  }

  return chunks;
}

export const DEFAULT_CORPUS_RAW: {
  id: string;
  name: string;
  title: string;
  year: string;
  category: 'speech' | 'interview' | 'article' | 'memoir';
  sourceCitation: string;
  content: string;
}[] = [
  {
    id: 'lky_1965_separation',
    name: '1965_Separation_Press_Conference.txt',
    title: 'Press Conference on the Separation of Singapore from Malaysia',
    year: '1965',
    category: 'speech',
    sourceCitation: 'Televised Press Conference at City Hall, Singapore, 9 August 1965 (National Archives of Singapore).',
    content: `For every time we look back on this moment when we signed this agreement which severed Singapore from Malaysia, it will be a moment of anguish. For me, it is a moment of anguish because all my life I have believed in merger and the unity of these two territories. You know, it is a people connected by geography, economics, and ties of kinship.

We are going to have a multiracial nation in Singapore. We will set the example. This is not a Malay nation; this is not a Chinese nation; this is not an Indian nation. Everybody will have his place: equal; language, culture, religion.

To the people of Singapore, I say: be calm, be confident. Singapore will survive. We have a cohesive people, hard-working, disciplined, and determined to make a living. We will forge ahead despite the odds. We must never allow communal politics or religious extremism to divide our people. Our survival depends on maintaining absolute racial and religious harmony, upholding the rule of law, and building an economy that provides jobs and security for every citizen.`
  },
  {
    id: 'lky_1966_national_day_rally',
    name: '1966_National_Day_Rally_Survival.txt',
    title: 'First National Day Rally: Building a Rugged, Disciplined Society',
    year: '1966',
    category: 'speech',
    sourceCitation: 'Prime Minister’s National Day Rally Speech, National Theatre, Singapore, 17 August 1966.',
    content: `Here we are, a small island of barely two million people with no natural resources, no hinterland, surrounded by larger neighbours in a turbulent region. If we are soft, if we are corrupt, if we are divided, we will perish. The world does not owe Singapore a living. We cannot live by begging for alms.

To survive, we must build a rugged society. A society of people who are physically fit, mentally alert, highly disciplined, and possessing a deep sense of national purpose. We must cultivate skills, promote technical education, and develop high standards of craftsmanship and industrial capability.

Governance must be scrupulously honest. In many developing nations, independence was followed by rapid deterioration due to corruption, nepotism, and ethnic factionalism. In Singapore, any minister or civil servant caught in corrupt practices will be investigated without fear or favour. Clean government is not an idealistic luxury; for a small vulnerable state, it is an existential imperative.

Every citizen must have a stake in the country. This is why we are investing heavily in home ownership through public housing (HDB) and the Central Provident Fund (CPF). When a man owns his home, he has something tangible to defend. He will fight for his street, his block, and his country.`
  },
  {
    id: 'lky_1968_harvard_meritocracy',
    name: '1968_Harvard_Address_Meritocracy.txt',
    title: 'Meritocracy, Talent, and Institution Building',
    year: '1968',
    category: 'speech',
    sourceCitation: 'Address at Harvard University John F. Kennedy School of Government, Cambridge, Massachusetts, 1968.',
    content: `A small country with no resources has only one asset: the intelligence, energy, and drive of its people. Therefore, the cardinal principle of our governance is meritocracy. We must seek out talent wherever it exists, nurture it through top-tier education, and place capable men and women in positions of executive responsibility, regardless of race, family background, or wealth.

If you promote people on the basis of connections, seniority, or political patronage, the machinery of state will slowly atrophy and fail. A first-rate civil service requires competitive remuneration to attract and retain the best minds from the private sector and prevent brain drain. Paying public servants adequately and holding them to ruthless standards of integrity is the only way to avoid the insidious spread of graft.

Pragmatism must govern policy decisions, not dogma or ideological slogans. We do not ask whether a policy is socialist or capitalist. We ask: does it work? Does it create jobs? Does it improve the living standards of our people? If an idea works in practice, we adopt and refine it; if it fails, we discard it without sentimentality.`
  },
  {
    id: 'lky_2005_us_china_geopolitics',
    name: '2005_US_China_Geopolitical_Strategy.txt',
    title: 'Geopolitics, US-China Relations, and the Balance of Power in Asia',
    year: '2005',
    category: 'interview',
    sourceCitation: 'Keynote Address & Dialogue at the Global Strategic Forum, Washington D.C., 2005.',
    content: `The rise of China is not just an ordinary economic shift; it is the largest geopolitical event in modern history. The sheer scale of China’s population and industrial momentum means the world must adjust to a new equilibrium. China will not simply integrate into a Western-designed order as an obedient participant; it will seek to reshape the rules to reflect its historical weight and sovereignty.

For peace and stability in the Asia-Pacific, an enduring balance of power is essential. The United States must remain actively engaged in East Asia across economic, diplomatic, and security dimensions. Without the US presence as a balancer, smaller Asian nations will have no room to maneuver and will inevitably fall under the dominant sphere of influence of regional giants.

Small states cannot afford to be naive. We do not make the mistake of believing international relations is governed by goodwill or abstract legalisms. It is governed by power, interests, and strategic leverage. Small states must maximize their relevance to major powers, build strong defense capabilities, maintain multiple international partnerships, and uphold ASEAN cohesion as a buffer against unilateral domination.`
  },
  {
    id: 'lky_2011_hard_truths',
    name: '2011_Hard_Truths_Governance_Economy.txt',
    title: 'Hard Truths to Keep Singapore Going: Pragmatism, Welfare, and Demographics',
    year: '2011',
    category: 'memoir',
    sourceCitation: 'Excerpts from "Hard Truths to Keep Singapore Going", Straits Times Press, 2011.',
    content: `We must never succumb to the populist temptations that have crippled many Western welfare states. If you give subsidies without requiring effort, you create a culture of dependency and entitlement, erode the work ethic, and bankrupt the treasury. In Singapore, our social safety nets are designed as trampolines, not hammocks. We help people help themselves through workfare, CPF savings, and targeted assistance.

Demographics is destiny. Our fertility rate has fallen far below replacement levels. If a society cannot replace itself, its economy will shrink, its defense forces will dwindle, and its vitality will wither. We must provide incentives for families, but we must also remain open to high-quality immigration to augment our talent pool, while managing integration carefully to preserve social harmony.

Bilingualism is our cultural and economic bedrock. English is the international language of commerce, science, diplomacy, and technology, providing a common working language for all ethnic groups. The mother tongue connects our citizens to their cultural roots and heritage values, preserving our moral compass against rootless consumerism.`
  },
  {
    id: 'lky_2013_one_mans_view',
    name: '2013_One_Mans_View_of_the_World.txt',
    title: 'One Man’s View of the World: Long-Term Global Trends and Leadership',
    year: '2013',
    category: 'memoir',
    sourceCitation: 'Excerpts from "One Man’s View of the World", Straits Times Press, 2013.',
    content: `Leadership requires seeing the world as it truly is, not as we wish it to be. Many leaders make catastrophic mistakes because they operate on wishful thinking, moral posturing, or ideological obsessions. An effective leader must be willing to take hard, unpopular decisions today that ensure the nation's survival twenty or thirty years down the road.

In statecraft, consistency and credibility are paramount. If you make a commitment, you must honor it. If you draw a red line, you must enforce it. If adversaries or partners perceive weakness or vacillation, your deterrence collapses.

Technology and innovation will continue to disrupt labor markets and national competitiveness. Nations that invest continuously in education, digital infrastructure, and lifelong training will thrive. Those that resist change out of bureaucratic inertia or populist protectionism will fall behind. You must adapt faster than the pace of change around you.`
  },
  {
    id: 'lky_1996_singapore21_values',
    name: '1996_Singapore_21_National_Values.txt',
    title: 'National Values, Social Compact, and Long-Term Foresight',
    year: '1996',
    category: 'speech',
    sourceCitation: 'Parliamentary Speech on Good Governance and Long-Term Stability, Parliament of Singapore, May 1996.',
    content: `What has brought us from a third-world colony to a first-world metropolis in one generation? It is not luck. It is cohesion, determination, an obsession with cleanliness and efficiency, and an unwavering commitment to honesty in government.

If Singapore ever loses its reputation for absolute integrity, the premium we command as a global financial and logistics hub will vanish overnight. Foreign investors do not come here because of our scenic landscapes; they come because contracts are enforced, intellectual property is protected, infrastructure works seamlessly, and public officials cannot be bought.

A nation is built not by buildings of concrete and glass, but by the bonds of mutual trust between the people and their leadership. That trust is earned through competence and delivery, not empty rhetoric.`
  }
];

export function getInitialCorpus(): SourceDocument[] {
  return DEFAULT_CORPUS_RAW.map((doc) => {
    const chunks = chunkText(doc.id, doc.name, doc.title, doc.content, 650, 120);
    return {
      id: doc.id,
      name: doc.name,
      title: doc.title,
      year: doc.year,
      category: doc.category,
      content: doc.content,
      chunks,
      sizeBytes: new Blob([doc.content]).size,
      uploadedAt: Date.now(),
      enabled: true,
      sourceCitation: doc.sourceCitation,
    };
  });
}
