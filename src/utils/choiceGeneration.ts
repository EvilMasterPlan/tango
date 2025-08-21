// Utility functions for generating answer choices
import { levenshteinEditDistance } from 'levenshtein-edit-distance';

// Hiragana character set for mutations
const HIRAGANA_CHARS = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょっ';

// Mapping of hiragana to similar-sounding alternatives
const SIMILAR_SOUNDS: Record<string, string[]> = {
  // Vowels
  'あ': ['い', 'う', 'え', 'お'],
  'い': ['あ', 'う', 'え', 'お'],
  'う': ['あ', 'い', 'え', 'お'],
  'え': ['あ', 'い', 'う', 'お'],
  'お': ['あ', 'い', 'う', 'え'],
  
  // K-series
  'か': ['き', 'く', 'け', 'こ'],
  'き': ['か', 'く', 'け', 'こ'],
  'く': ['か', 'き', 'け', 'こ'],
  'け': ['か', 'き', 'く', 'こ'],
  'こ': ['か', 'き', 'く', 'け'],
  
  // S-series
  'さ': ['し', 'す', 'せ', 'そ'],
  'し': ['さ', 'す', 'せ', 'そ'],
  'す': ['さ', 'し', 'せ', 'そ'],
  'せ': ['さ', 'し', 'す', 'そ'],
  'そ': ['さ', 'し', 'す', 'せ'],
  
  // T-series
  'た': ['ち', 'つ', 'て', 'と'],
  'ち': ['た', 'つ', 'て', 'と'],
  'つ': ['た', 'ち', 'て', 'と'],
  'て': ['た', 'ち', 'つ', 'と'],
  'と': ['た', 'ち', 'つ', 'て'],
  
  // N-series
  'な': ['に', 'ぬ', 'ね', 'の'],
  'に': ['な', 'ぬ', 'ね', 'の'],
  'ぬ': ['な', 'に', 'ね', 'の'],
  'ね': ['な', 'に', 'ぬ', 'の'],
  'の': ['な', 'に', 'ぬ', 'ね'],
  
  // H-series
  'は': ['ひ', 'ふ', 'へ', 'ほ'],
  'ひ': ['は', 'ふ', 'へ', 'ほ'],
  'ふ': ['は', 'ひ', 'へ', 'ほ'],
  'へ': ['は', 'ひ', 'ふ', 'ほ'],
  'ほ': ['は', 'ひ', 'ふ', 'へ'],
  
  // M-series
  'ま': ['み', 'む', 'め', 'も'],
  'み': ['ま', 'む', 'め', 'も'],
  'む': ['ま', 'み', 'め', 'も'],
  'め': ['ま', 'み', 'む', 'も'],
  'も': ['ま', 'み', 'む', 'め'],
  
  // Y-series
  'や': ['ゆ', 'よ'],
  'ゆ': ['や', 'よ'],
  'よ': ['や', 'ゆ'],
  
  // R-series
  'ら': ['り', 'る', 'れ', 'ろ'],
  'り': ['ら', 'る', 'れ', 'ろ'],
  'る': ['ら', 'り', 'れ', 'ろ'],
  'れ': ['ら', 'り', 'る', 'ろ'],
  'ろ': ['ら', 'り', 'る', 'れ'],
  
  // W-series
  'わ': ['を'],
  'を': ['わ'],
  
  // G-series (voiced K)
  'が': ['ぎ', 'ぐ', 'げ', 'ご'],
  'ぎ': ['が', 'ぐ', 'げ', 'ご'],
  'ぐ': ['が', 'ぎ', 'げ', 'ご'],
  'げ': ['が', 'ぎ', 'ぐ', 'ご'],
  'ご': ['が', 'ぎ', 'ぐ', 'げ'],
  
  // Z-series (voiced S)
  'ざ': ['じ', 'ず', 'ぜ', 'ぞ'],
  'じ': ['ざ', 'ず', 'ぜ', 'ぞ'],
  'ず': ['ざ', 'じ', 'ぜ', 'ぞ'],
  'ぜ': ['ざ', 'じ', 'ず', 'ぞ'],
  'ぞ': ['ざ', 'じ', 'ず', 'ぜ'],
  
  // D-series (voiced T)
  'だ': ['ぢ', 'づ', 'で', 'ど'],
  'ぢ': ['だ', 'づ', 'で', 'ど'],
  'づ': ['だ', 'ぢ', 'で', 'ど'],
  'で': ['だ', 'ぢ', 'づ', 'ど'],
  'ど': ['だ', 'ぢ', 'づ', 'で'],
  
  // B-series (voiced H)
  'ば': ['び', 'ぶ', 'べ', 'ぼ'],
  'び': ['ば', 'ぶ', 'べ', 'ぼ'],
  'ぶ': ['ば', 'び', 'べ', 'ぼ'],
  'べ': ['ば', 'び', 'ぶ', 'ぼ'],
  'ぼ': ['ば', 'び', 'ぶ', 'べ'],
  
  // P-series (aspirated H)
  'ぱ': ['ぴ', 'ぷ', 'ぺ', 'ぽ'],
  'ぴ': ['ぱ', 'ぷ', 'ぺ', 'ぽ'],
  'ぷ': ['ぱ', 'ぴ', 'ぺ', 'ぽ'],
  'ぺ': ['ぱ', 'ぴ', 'ぷ', 'ぽ'],
  'ぽ': ['ぱ', 'ぴ', 'ぷ', 'ぺ'],
  
  // Small characters
  'ゃ': ['ゅ', 'ょ'],
  'ゅ': ['ゃ', 'ょ'],
  'ょ': ['ゃ', 'ゅ'],
  
  // Special characters
  'っ': ['っ'], // No alternatives for sokuon
  'ん': ['ん'], // No alternatives for n
};

// Simple UUID generator
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Find the most similar readings from a pool of readings
export function findSimilarReadings(
  targetReading: string,
  allReadings: string[],
  count: number = 2
): string[] {
  const distances = allReadings
    .filter(reading => reading !== targetReading)
    .map(reading => ({
      reading,
      distance: levenshteinEditDistance(targetReading, reading)
    }))
    .sort((a, b) => a.distance - b.distance);
  
  return distances.slice(0, count).map(item => item.reading);
}

// Helper function to determine if a character is okurigana based on the original word
function isOkurigana(char: string, position: number, reading: string, originalWord: string): boolean {
  // Find the longest matching prefix from the original word
  const maxPrefixLength = Array.from({ length: originalWord.length }, (_, i) => i + 1)
    .reverse()
    .find(i => reading.startsWith(originalWord.substring(0, i))) || 0;
  
  // Find the longest matching suffix from the original word
  const maxSuffixLength = Array.from({ length: originalWord.length }, (_, i) => i + 1)
    .reverse()
    .find(i => reading.endsWith(originalWord.substring(originalWord.length - i))) || 0;
  
  // If this character is in the prefix or suffix that matches the original word, it's okurigana
  return position < maxPrefixLength || position >= reading.length - maxSuffixLength;
}

// Generate a mutation of the correct reading by changing one character
export function generateReadingMutation(correctReading: string, originalWord?: string): string {
  if (correctReading.length === 0) return correctReading;
  
  // 20% chance to try small tsu removal if applicable
  if (Math.random() < 0.2 && correctReading.includes('っ')) {
    const tsuIndex = correctReading.indexOf('っ');
    if (tsuIndex !== -1) {
      return correctReading.slice(0, tsuIndex) + correctReading.slice(tsuIndex + 1);
    }
  }
  
  // Find characters that are safe to mutate (not okurigana)
  const safeIndices = Array.from({ length: correctReading.length }, (_, i) => i)
    .filter(i => !isOkurigana(correctReading[i], i, correctReading, originalWord || ''));
  
  // If no safe characters found, fall back to original logic
  if (safeIndices.length === 0) {
    const randomIndex = Math.floor(Math.random() * correctReading.length);
    const targetChar = correctReading[randomIndex];
    
    const alternatives = SIMILAR_SOUNDS[targetChar];
    if (alternatives && alternatives.length > 0) {
      const randomAlternative = alternatives[Math.floor(Math.random() * alternatives.length)];
      return (
        correctReading.slice(0, randomIndex) +
        randomAlternative +
        correctReading.slice(randomIndex + 1)
      );
    } else {
      const randomHiragana = HIRAGANA_CHARS[Math.floor(Math.random() * HIRAGANA_CHARS.length)];
      return (
        correctReading.slice(0, randomIndex) +
        randomHiragana +
        correctReading.slice(randomIndex + 1)
      );
    }
  }
  
  // Pick a random safe character to mutate
  const randomSafeIndex = safeIndices[Math.floor(Math.random() * safeIndices.length)];
  const targetChar = correctReading[randomSafeIndex];
  
  // Get similar-sounding alternatives for the target character
  const alternatives = SIMILAR_SOUNDS[targetChar];
  
  if (alternatives && alternatives.length > 0) {
    // Pick a random alternative
    const randomAlternative = alternatives[Math.floor(Math.random() * alternatives.length)];
    return (
      correctReading.slice(0, randomSafeIndex) +
      randomAlternative +
      correctReading.slice(randomSafeIndex + 1)
    );
  } else {
    // Fallback to random hiragana if no mapping exists
    const randomHiragana = HIRAGANA_CHARS[Math.floor(Math.random() * HIRAGANA_CHARS.length)];
    return (
      correctReading.slice(0, randomSafeIndex) +
      randomHiragana +
      correctReading.slice(randomSafeIndex + 1)
    );
  }
}

// Helper function to detect if a word is partially kanji (has hiragana mixed in)
function isPartiallyKanji(originalWord: string): boolean {
  // If the original word contains any hiragana characters, it's partially kanji
  const hiraganaRegex = /[あ-ん]/;
  return hiraganaRegex.test(originalWord);
}

// Generate all answer choices for a question
export function generateAnswerChoices(
  correctReading: string,
  allReadings: string[],
  options: {
    similarCount?: number;
    mutationCount?: number;
    originalWord?: string;
  } = {}
): Array<{ id: string; text: string; correct: boolean }> {
  const choices: Array<{ id: string; text: string; correct: boolean }> = [];
  
  // Stage 1: Add correct choice
  choices.push({
    id: generateId(),
    text: correctReading,
    correct: true
  });
  
  // Stage 2: Find 3 unique similar readings as fallback
  const similarReadings = findSimilarReadings(correctReading, allReadings, 3);
  
  // Stage 3: Generate 3 unique mutations
  const mutations: string[] = [];
  let attempts = 20; // Prevent infinite loops
  
  while (mutations.length < 3 && attempts > 0) {
    const mutation = generateReadingMutation(correctReading, options.originalWord);
    if (!mutations.includes(mutation) && mutation !== correctReading) {
      mutations.push(mutation);
    }
    attempts--;
  }
  
  // Create pool of all options (excluding correct choice)
  const allOptions = [...similarReadings, ...mutations];
  
  // Sample from pool to fill remaining 3 slots, ensuring uniqueness
  const remainingChoices = 3;
  const selectedOptions = new Set<string>();
  
  // Try to pick mutations first, then similar readings
  for (const mutation of mutations) {
    if (selectedOptions.size >= remainingChoices) break;
    if (!selectedOptions.has(mutation)) {
      selectedOptions.add(mutation);
    }
  }
  
  // Fill remaining slots with similar readings
  for (const reading of similarReadings) {
    if (selectedOptions.size >= remainingChoices) break;
    if (!selectedOptions.has(reading)) {
      selectedOptions.add(reading);
    }
  }
  
  // Add selected options to choices
  choices.push(...Array.from(selectedOptions).map(text => ({
    id: generateId(),
    text,
    correct: false
  })));
  
  // Shuffle choices using modern array methods
  return choices.sort(() => Math.random() - 0.5);
}
