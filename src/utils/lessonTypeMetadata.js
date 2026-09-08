// Display metadata for each backend lesson type, shared by the home page's
// lesson tiles (Home/Page.jsx) and the practice page's full list
// (Practice/Page.jsx) — one name/icon/subtitle per lesson type rather than
// each page keeping its own copy. Keyed by the same lesson type string used
// for CSS class suffixes in both pages, so there's exactly one source of
// truth per lesson type. `icon` is a single bold kanji (or JLPT code)
// rendered as plain text, so each page's own CSS can tint it to that
// lesson's accent color.
export const LESSON_METADATA_BY_LESSON_TYPE = {
  new_words: {
    icon: '新',
    title: 'New Words',
    subtitle: "Explore the wild unknown",
  },
  level_up: {
    icon: '強',
    title: 'Level Up',
    subtitle: 'Focus on mastery',
  },
  fix_mistakes: {
    icon: '正',
    title: 'Fix Mistakes',
    subtitle: "Get good",
  },
  kanji_spotlight: {
    icon: '字',
    title: 'Kanji Spotlight',
    subtitle: 'They contain multitudes',
  },
  from_the_top: {
    icon: '頭',
    title: 'From the Top',
    subtitle: 'Back to basics',
  },
  // One lesson type per question type — mirrors the backend's
  // QUESTION_TYPE_VARIANTS (lessonPools.js), each restricted to a single
  // question type rather than mixing several per lesson like every type
  // above. reading_spelling/reading_typing/word_wheel only ever show up on
  // the home page once at least one word has actually unlocked that
  // question type (see nextLessons.js) — the practice page below lists
  // them unconditionally, same as every other type, and just falls back to
  // a NEW_WORDS lesson if nothing qualifies yet.
  word_choice: {
    icon: '選',
    title: 'Word Choice',
    subtitle: 'Pick the right word',
  },
  reading_choice: {
    icon: '読',
    title: 'Reading Choice',
    subtitle: 'Sound it out',
  },
  meaning_choice: {
    icon: '意',
    title: 'Meaning Choice',
    subtitle: 'Know what it means',
  },
  reading_spelling: {
    icon: '綴',
    title: 'Spelling',
    subtitle: 'Piece it together',
  },
  reading_typing: {
    icon: '打',
    title: 'Typing',
    subtitle: 'Type it from memory',
  },
  word_wheel: {
    icon: '輪',
    title: 'Word Wheel',
    subtitle: 'Spin it into place',
  },
  jlpt_n5: {
    icon: 'N5',
    title: 'JLPT N5',
    subtitle: 'Study for the test',
  },
  jlpt_n4: {
    icon: 'N4',
    title: 'JLPT N4',
    subtitle: 'Keep climbing',
  },
  jlpt_n3: {
    icon: 'N3',
    title: 'JLPT N3',
    subtitle: 'The long middle',
  },
  jlpt_n2: {
    icon: 'N2',
    title: 'JLPT N2',
    subtitle: 'Getting serious',
  },
  jlpt_n1: {
    icon: 'N1',
    title: 'JLPT N1',
    subtitle: 'The final boss',
  },
  random: {
    icon: '闇',
    title: 'Random',
    subtitle: 'A shot in the dark',
  },
  word_spotlight: {
    icon: '葉',
    title: 'Word Spotlight',
    subtitle: 'One word, up close',
  },
};

// Lesson types that need a seed (extra data beyond the bare type string —
// see quizApi.generateLesson's lessonParams) to mean anything — kept
// in sync with the backend's own lessonPools.js SEEDED_LESSON_TYPES. A
// seeded type has nowhere to get its seed from in a generic "pick any
// lesson type" surface, so it's excluded from ALL_LESSON_TYPES below —
// word_spotlight is only ever started from a specific word (e.g. clicking
// a WordTile on the Overview page), never from the home page's rotation or
// the practice page's full list.
const SEEDED_LESSON_TYPES = ['word_spotlight'];

// Every known lesson type a generic "pick any lesson type" surface can
// offer, in the app's canonical display order — used by the practice page,
// which (unlike the home page) always lists all of them rather than a
// per-user-unlocked subset. Excludes SEEDED_LESSON_TYPES (see above).
export const ALL_LESSON_TYPES = Object.keys(LESSON_METADATA_BY_LESSON_TYPE).filter(
  (lessonType) => !SEEDED_LESSON_TYPES.includes(lessonType)
);
