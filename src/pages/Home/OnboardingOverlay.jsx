import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { MasteryGem } from '@/components/quiz/charts/MasteryGem';
import { VocabularyDisplay } from '@/components/quiz/vocabulary/VocabularyDisplay';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { accountApi } from '@/utils/api/account';
import { cx } from '@/utils/cx';
import './OnboardingOverlay.scss';

const TOTAL_STAGES = 3;

// Fake mastery snapshot for the phase-2 gem demo — not a real word, just
// enough shape (5 axes, level 1, 2 iterations to the next level) to show off
// what a fresh MasteryGem looks like. Four axes sit at 1 of the 2 steps to
// the next level (half-full); the last (DEMO_PREVIEW_AXIS_KEY) sits at 0, so
// the hatched preview on it (see MasteryGem's `currentSkillKey`) shows what
// one more correct answer there would look like — bringing every axis to
// the same half-full point, rather than maxing one out.
const DEMO_AXIS_KEYS = ['demo.axis1', 'demo.axis2', 'demo.axis3', 'demo.axis4', 'demo.axis5'];
const DEMO_PREVIEW_AXIS_KEY = DEMO_AXIS_KEYS[DEMO_AXIS_KEYS.length - 1];
const DEMO_MASTERY = {
  ...Object.fromEntries(
    DEMO_AXIS_KEYS.map((key) => [key, { correct: key === DEMO_PREVIEW_AXIS_KEY ? 0 : 1, incorrect: 0 }])
  ),
  iteration: 0,
  level: 1,
  iterationsForNextLevel: 2,
};

// Hardcoded vocab entry for the phase-3 word-display demo — a real entry
// from distilled_vocab.min.json, shown fully revealed (VocabularyDisplay's
// `revealed`) rather than blanking any of word/reading/definition the way
// an actual quiz question would.
const DEMO_WORD_ENTRY = {
  id: '09d101c1-ec8d-5319-b3fd-cf3c791c74c2',
  word: '土曜日',
  reading: 'どようび',
  definition: 'Saturday',
  score: 0.873267,
  morphology: ['adverb', 'noun'],
  furigana: [
    { text: '土', reading: 'ど' },
    { text: '曜', reading: 'よう' },
    { text: '日', reading: 'び' },
  ],
  jlpt: 'N5',
};

// A brand-new word's mastery — every skill key at 0 correct/incorrect,
// level 1 — same shape MasteryGem expects (see its own doc comment), just
// fabricated here rather than fetched, since this demo entry was never
// actually practiced.
const DEMO_WORD_SKILL_KEYS = ['word.choice', 'reading.choice', 'meaning.choice', 'reading.spelling', 'reading.typing'];
const DEMO_WORD_MASTERY = {
  ...Object.fromEntries(DEMO_WORD_SKILL_KEYS.map((key) => [key, { correct: 0, incorrect: 0 }])),
  iteration: 0,
  level: 1,
  iterationsForNextLevel: 2,
};

const HANDLE_MIN_LENGTH = 3;
const HANDLE_MAX_LENGTH = 20;
const HANDLE_CHECK_DEBOUNCE_MS = 400;

// Strips anything but lowercase letters/digits/-/_  and forces lowercase —
// same character set the backend enforces (see tango/user.js's
// HANDLE_PATTERN) — so what's on screen always matches what would actually
// be accepted, rather than letting an input get typed and only rejected
// later.
function sanitizeHandleInput(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, HANDLE_MAX_LENGTH);
}

// Full-screen first-run wizard — shown by HomePage whenever
// `user.onboarded` is falsy, covering the whole app (via a portal, same as
// Modal) rather than sitting inside the page's own layout. `onComplete` is
// called once the account is actually marked onboarded server-side, so the
// caller can refresh its own copy of `user` and let this overlay unmount
// (it does not unmount itself — nothing here assumes what happens to
// `user.onboarded` afterward).
//
// `hasHandle` (from `user.handle`, since this component doesn't otherwise
// need the rest of `user`) skips straight past the handle stage — the
// account might already have one from some other path (e.g. onboarding was
// interrupted after setting it but before completing) — landing on stage 1
// with dot 0 already showing done rather than making the wizard ask again
// for something it already has an answer to.
export function OnboardingOverlay({ hasHandle, onComplete }) {
  const [stageIndex, setStageIndex] = useState(() => (hasHandle ? 1 : 0));
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [handle, setHandle] = useState('');
  // null (nothing checked / input too short yet), 'checking', 'available',
  // or 'taken'.
  const [handleCheckStatus, setHandleCheckStatus] = useState(null);

  // The setup function has to actually set this true (not just rely on
  // useRef's initial value), or StrictMode's dev-only double-invoke of
  // effects (mount -> cleanup -> mount again) leaves it permanently false
  // after that first simulated unmount's cleanup runs — silently
  // discarding every debounced check's result for the component's whole
  // real lifetime, with no visible error.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Guards against an in-flight check for an older value resolving after a
  // newer one (e.g. slow network reordering two responses) and clobbering
  // the status shown for whatever's actually in the field now.
  const latestCheckedHandleRef = useRef(null);

  const checkHandleAvailability = useDebouncedCallback(async (candidateHandle) => {
    latestCheckedHandleRef.current = candidateHandle;
    try {
      await accountApi.checkHandleAvailability(candidateHandle);
      if (isMountedRef.current && latestCheckedHandleRef.current === candidateHandle) {
        setHandleCheckStatus('available');
      }
    } catch (apiError) {
      if (!isMountedRef.current || latestCheckedHandleRef.current !== candidateHandle) return;
      if (apiError.response?.status === 409) {
        setHandleCheckStatus('taken');
      } else {
        setHandleCheckStatus(null);
        console.warn('Failed to check handle availability:', apiError);
      }
    }
  }, HANDLE_CHECK_DEBOUNCE_MS);

  function handleHandleInputChange(rawValue) {
    const sanitized = sanitizeHandleInput(rawValue);
    setHandle(sanitized);

    if (sanitized.length < HANDLE_MIN_LENGTH) {
      latestCheckedHandleRef.current = null;
      setHandleCheckStatus(null);
      return;
    }

    // Clears any stale available/taken result from a previous value right
    // away, rather than leaving it on screen until the debounced check
    // actually resolves for the new one.
    setHandleCheckStatus('checking');
    checkHandleAvailability(sanitized);
  }

  const isHandleStage = stageIndex === 0;
  const isGemDemoStage = stageIndex === 1;
  const isLastStage = stageIndex === TOTAL_STAGES - 1;
  const canContinue = !isHandleStage || handleCheckStatus === 'available';

  function handleSubmit(e) {
    e.preventDefault();
    if (isAdvancing || !canContinue) return;
    handleContinue();
  }

  async function handleContinue() {
    setIsAdvancing(true);
    try {
      if (isHandleStage) {
        try {
          await accountApi.setHandle(handle);
        } catch (apiError) {
          // The debounced check already said "available" or Continue
          // wouldn't be enabled — this only fires if someone else claimed
          // it in the gap between that check and clicking Continue.
          if (apiError.response?.status === 409) {
            setHandleCheckStatus('taken');
          } else {
            console.warn('Failed to set handle:', apiError);
          }
          return;
        }
      }

      if (!isLastStage) {
        setStageIndex((index) => index + 1);
        return;
      }

      await accountApi.completeOnboarding();
      onComplete();
    } finally {
      setIsAdvancing(false);
    }
  }

  return createPortal(
    <div className="onboarding-overlay">
      <form className="onboarding-overlay__panel" onSubmit={handleSubmit}>
        <div className="onboarding-overlay__dots">
          {Array.from({ length: TOTAL_STAGES }, (_, index) => (
            // Fixed-size slot around each dot, same trick as QuizProgress —
            // the current stage's larger dot doesn't shift the others.
            <span key={index} className="onboarding-overlay__dot-slot">
              <span
                className={cx(
                  'onboarding-overlay__dot',
                  index < stageIndex && 'onboarding-overlay__dot--done',
                  index === stageIndex && 'onboarding-overlay__dot--current'
                )}
              />
            </span>
          ))}
        </div>

        <div className="onboarding-overlay__content">
          {isHandleStage ? (
            <div className="onboarding-overlay__handle-stage">
              <TextField
                label="Choose a handle"
                id="onboarding-handle"
                value={handle}
                onChange={(e) => handleHandleInputChange(e.target.value)}
                placeholder="@handle"
                autoFocus
              />
              {/* Always rendered, fixed-height, regardless of whether
                  there's a result yet — reserves the status line's own
                  space up front so it fading in/out never shifts the
                  TextField or Continue button above/below it. */}
              <div className="onboarding-overlay__handle-status-slot">
                {(handleCheckStatus === 'available' || handleCheckStatus === 'taken') && (
                  <div
                    key={handleCheckStatus}
                    className={cx(
                      'onboarding-overlay__handle-status',
                      `onboarding-overlay__handle-status--${handleCheckStatus}`
                    )}
                  >
                    <span className="onboarding-overlay__handle-status-dot" />
                    <span>
                      {handleCheckStatus === 'available' ? 'That handle is available!' : 'That handle is taken!'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : isGemDemoStage ? (
            <div className="onboarding-overlay__gem-demo">
              <p className="onboarding-overlay__gem-demo-title">Tanuki Tango is a hardcore Japanese vocab driller</p>
              <MasteryGem mastery={DEMO_MASTERY} currentSkillKey={DEMO_PREVIEW_AXIS_KEY} color="blue" />
              <p className="onboarding-overlay__gem-demo-caption">Level up a word by practicing different aspects of it</p>
            </div>
          ) : (
            <div className="onboarding-overlay__word-demo">
              <p className="onboarding-overlay__gem-demo-title">We focus only on words that contain Kanji</p>
              <VocabularyDisplay entry={DEMO_WORD_ENTRY} mastery={DEMO_WORD_MASTERY} revealed />
              <p className="onboarding-overlay__gem-demo-caption">
                You'll learn Kanji by practicing whole words.
                <br />
                Good luck, drillers!
              </p>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isAdvancing || !canContinue}>
          {isHandleStage ? 'Continue' : isGemDemoStage ? 'Cool!' : "Let's Go!"}
        </Button>
      </form>
    </div>,
    document.body
  );
}
