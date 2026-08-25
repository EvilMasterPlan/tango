// Japanese-specific utilities for generating quiz answer choices.
// Ported from OvermindAPI/src/tango/generate/japaneseUtils.js.

export const HIRAGANA_CHARS =
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょっ';

export const KATAKANA_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポャュョッ';

// Mapping of hiragana to similar-sounding alternatives (same consonant/vowel row).
const SIMILAR_SOUNDS_HIRAGANA = {
  'あ': ['い', 'う', 'え', 'お'],
  'い': ['あ', 'う', 'え', 'お'],
  'う': ['あ', 'い', 'え', 'お'],
  'え': ['あ', 'い', 'う', 'お'],
  'お': ['あ', 'い', 'う', 'え'],

  'か': ['き', 'く', 'け', 'こ'],
  'き': ['か', 'く', 'け', 'こ'],
  'く': ['か', 'き', 'け', 'こ'],
  'け': ['か', 'き', 'く', 'こ'],
  'こ': ['か', 'き', 'く', 'け'],

  'さ': ['し', 'す', 'せ', 'そ'],
  'し': ['さ', 'す', 'せ', 'そ'],
  'す': ['さ', 'し', 'せ', 'そ'],
  'せ': ['さ', 'し', 'す', 'そ'],
  'そ': ['さ', 'し', 'す', 'せ'],

  'た': ['ち', 'つ', 'て', 'と'],
  'ち': ['た', 'つ', 'て', 'と'],
  'つ': ['た', 'ち', 'て', 'と'],
  'て': ['た', 'ち', 'つ', 'と'],
  'と': ['た', 'ち', 'つ', 'て'],

  'な': ['に', 'ぬ', 'ね', 'の'],
  'に': ['な', 'ぬ', 'ね', 'の'],
  'ぬ': ['な', 'に', 'ね', 'の'],
  'ね': ['な', 'に', 'ぬ', 'の'],
  'の': ['な', 'に', 'ぬ', 'ね'],

  'は': ['ひ', 'ふ', 'へ', 'ほ'],
  'ひ': ['は', 'ふ', 'へ', 'ほ'],
  'ふ': ['は', 'ひ', 'へ', 'ほ'],
  'へ': ['は', 'ひ', 'ふ', 'ほ'],
  'ほ': ['は', 'ひ', 'ふ', 'へ'],

  'ま': ['み', 'む', 'め', 'も'],
  'み': ['ま', 'む', 'め', 'も'],
  'む': ['ま', 'み', 'め', 'も'],
  'め': ['ま', 'み', 'む', 'も'],
  'も': ['ま', 'み', 'む', 'め'],

  'や': ['ゆ', 'よ'],
  'ゆ': ['や', 'よ'],
  'よ': ['や', 'ゆ'],

  'ら': ['り', 'る', 'れ', 'ろ'],
  'り': ['ら', 'る', 'れ', 'ろ'],
  'る': ['ら', 'り', 'れ', 'ろ'],
  'れ': ['ら', 'り', 'る', 'ろ'],
  'ろ': ['ら', 'り', 'る', 'れ'],

  'わ': ['を'],
  'を': ['わ'],

  'が': ['ぎ', 'ぐ', 'げ', 'ご'],
  'ぎ': ['が', 'ぐ', 'げ', 'ご'],
  'ぐ': ['が', 'ぎ', 'げ', 'ご'],
  'げ': ['が', 'ぎ', 'ぐ', 'ご'],
  'ご': ['が', 'ぎ', 'ぐ', 'げ'],

  'ざ': ['じ', 'ず', 'ぜ', 'ぞ'],
  'じ': ['ざ', 'ず', 'ぜ', 'ぞ'],
  'ず': ['ざ', 'じ', 'ぜ', 'ぞ'],
  'ぜ': ['ざ', 'じ', 'ず', 'ぞ'],
  'ぞ': ['ざ', 'じ', 'ず', 'ぜ'],

  'だ': ['ぢ', 'づ', 'で', 'ど'],
  'ぢ': ['だ', 'づ', 'で', 'ど'],
  'づ': ['だ', 'ぢ', 'で', 'ど'],
  'で': ['だ', 'ぢ', 'づ', 'ど'],
  'ど': ['だ', 'ぢ', 'づ', 'で'],

  'ば': ['び', 'ぶ', 'べ', 'ぼ'],
  'び': ['ば', 'ぶ', 'べ', 'ぼ'],
  'ぶ': ['ば', 'び', 'べ', 'ぼ'],
  'べ': ['ば', 'び', 'ぶ', 'ぼ'],
  'ぼ': ['ば', 'び', 'ぶ', 'べ'],

  'ぱ': ['ぴ', 'ぷ', 'ぺ', 'ぽ'],
  'ぴ': ['ぱ', 'ぷ', 'ぺ', 'ぽ'],
  'ぷ': ['ぱ', 'ぴ', 'ぺ', 'ぽ'],
  'ぺ': ['ぱ', 'ぴ', 'ぷ', 'ぽ'],
  'ぽ': ['ぱ', 'ぴ', 'ぷ', 'ぺ'],

  'ゃ': ['ゅ', 'ょ'],
  'ゅ': ['ゃ', 'ょ'],
  'ょ': ['ゃ', 'ゅ'],

  'っ': ['っ'],
  'ん': ['ん'],
};

// Hiragana and katakana occupy parallel Unicode blocks offset by 0x60,
// so the katakana map can be derived by shifting each hiragana entry.
const HIRAGANA_TO_KATAKANA_OFFSET = 0x60;

function toKatakana(char) {
  return String.fromCharCode(char.charCodeAt(0) + HIRAGANA_TO_KATAKANA_OFFSET);
}

const SIMILAR_SOUNDS_KATAKANA = Object.fromEntries(
  Object.entries(SIMILAR_SOUNDS_HIRAGANA).map(([char, alternatives]) => [
    toKatakana(char),
    alternatives.map(toKatakana),
  ])
);

const SIMILAR_SOUNDS = { ...SIMILAR_SOUNDS_HIRAGANA, ...SIMILAR_SOUNDS_KATAKANA };

export function isKatakana(text) {
  // Includes the prolonged sound mark (ー), which sits outside the katakana
  // Unicode block proper but only ever appears in katakana readings.
  return /[ァ-ヶー]/.test(text);
}

// A character is "okurigana" (part of the kanji reading, not free-floating kana)
// if it falls within the longest prefix/suffix the reading shares with the word itself.
export function isOkurigana(char, position, reading, originalWord) {
  const maxPrefixLength =
    Array.from({ length: originalWord.length }, (_, i) => i + 1)
      .reverse()
      .find((i) => reading.startsWith(originalWord.substring(0, i))) || 0;

  const maxSuffixLength =
    Array.from({ length: originalWord.length }, (_, i) => i + 1)
      .reverse()
      .find((i) => reading.endsWith(originalWord.substring(originalWord.length - i))) || 0;

  return position < maxPrefixLength || position >= reading.length - maxSuffixLength;
}

export function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[rows - 1][cols - 1];
}

// Finds the closest real readings from a pool, by edit distance to the target.
export function findSimilarReadings(targetReading, allReadings, count = 2) {
  return allReadings
    .filter((reading) => reading !== targetReading)
    .map((reading) => ({ reading, distance: levenshteinDistance(targetReading, reading) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map((item) => item.reading);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Mutates one character of `correctReading` into a similar-sounding alternative.
export function generateReadingMutation(correctReading, originalWord) {
  if (correctReading.length === 0) return correctReading;

  const smallTsu = correctReading.includes('っ') ? 'っ' : correctReading.includes('ッ') ? 'ッ' : null;
  if (smallTsu && Math.random() < 0.2) {
    const tsuIndex = correctReading.indexOf(smallTsu);
    return correctReading.slice(0, tsuIndex) + correctReading.slice(tsuIndex + 1);
  }

  const allIndices = Array.from({ length: correctReading.length }, (_, i) => i);
  const safeIndices = allIndices.filter(
    (i) => !isOkurigana(correctReading[i], i, correctReading, originalWord || '')
  );
  const candidateIndices = safeIndices.length > 0 ? safeIndices : allIndices;

  const randomIndex = pickRandom(candidateIndices);
  const targetChar = correctReading[randomIndex];
  const alternatives = SIMILAR_SOUNDS[targetChar];

  const replacement = alternatives?.length
    ? pickRandom(alternatives)
    : pickRandom(isKatakana(targetChar) ? [...KATAKANA_CHARS] : [...HIRAGANA_CHARS]);

  return correctReading.slice(0, randomIndex) + replacement + correctReading.slice(randomIndex + 1);
}
