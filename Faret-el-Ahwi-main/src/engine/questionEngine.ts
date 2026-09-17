import rawQuestionsData from '../data/questions.json';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: QuestionDifficulty;
  tags: string[];
}

const DEFAULT_FALLBACK_QUESTION: Question = {
  id: 0,
  question: 'سمّي أكلة لبنانية',
  category: 'food',
  difficulty: 'easy',
  tags: ['lebanese', 'food', 'fallback'],
};

// Validate on load (console warning, not crash)
function validateQuestionsBank(data: unknown): Question[] {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('[ZAKA QuestionEngine] Questions bank is empty or not an array. Falling back to default question.');
    return [DEFAULT_FALLBACK_QUESTION];
  }

  const validQuestions: Question[] = [];
  const seenIds = new Set<number>();
  const seenTexts = new Set<string>();

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'number' ||
      typeof item.question !== 'string' ||
      !item.question.trim() ||
      typeof item.category !== 'string' ||
      !['easy', 'medium', 'hard'].includes(item.difficulty) ||
      !Array.isArray(item.tags)
    ) {
      console.warn(`[ZAKA QuestionEngine] Item at index ${i} is missing required fields or has invalid structure:`, item);
      continue;
    }

    if (seenIds.has(item.id)) {
      console.warn(`[ZAKA QuestionEngine] Duplicate question id detected: ${item.id} at index ${i}.`);
      continue;
    }

    const normalizedText = item.question.trim().toLowerCase();
    if (seenTexts.has(normalizedText)) {
      console.warn(`[ZAKA QuestionEngine] Duplicate question text detected: "${item.question}" at index ${i}.`);
    }

    seenIds.add(item.id);
    seenTexts.add(normalizedText);
    validQuestions.push(item as Question);
  }

  if (validQuestions.length === 0) {
    console.warn('[ZAKA QuestionEngine] No valid questions found after validation. Falling back to default question.');
    return [DEFAULT_FALLBACK_QUESTION];
  }

  return validQuestions;
}

export const QUESTIONS_BANK: readonly Question[] = Object.freeze(validateQuestionsBank(rawQuestionsData));

// RECENT_HISTORY_SIZE = 10 (or bank size / 3, whichever is smaller)
export const RECENT_HISTORY_SIZE: number = Math.min(10, Math.max(1, Math.floor(QUESTIONS_BANK.length / 3)));

/**
 * Picks a random question NOT in the exclude list.
 * Falls back gracefully if the candidate pool is exhausted.
 */
export function getRandomQuestion(excludeRecentIds: number[] = []): Question {
  if (QUESTIONS_BANK.length === 0) {
    return DEFAULT_FALLBACK_QUESTION;
  }

  const excludeSet = new Set(excludeRecentIds);
  const candidates = QUESTIONS_BANK.filter((q) => !excludeSet.has(q.id));

  // If candidates available, pick randomly
  if (candidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  // Graceful fallback if bank is too small or all questions were excluded
  const fallbackCandidates = excludeRecentIds.length > 0
    ? QUESTIONS_BANK.filter((q) => q.id !== excludeRecentIds[excludeRecentIds.length - 1])
    : QUESTIONS_BANK;

  const finalPool = fallbackCandidates.length > 0 ? fallbackCandidates : QUESTIONS_BANK;
  const randomIndex = Math.floor(Math.random() * finalPool.length);
  return finalPool[randomIndex] || DEFAULT_FALLBACK_QUESTION;
}
