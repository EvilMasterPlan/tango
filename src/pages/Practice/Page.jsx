import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack, IoLockClosed } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { ALL_LESSON_TYPES, LESSON_METADATA_BY_LESSON_TYPE } from '@/utils/lessonTypeMetadata';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import { useUserContext } from '@/contexts/UserContext';
import { FREE_JLPT_LEVEL, hasFullAccess } from '@/utils/planAccess';
import '@/pages/Practice/Page.scss';

// Visually grouped into three blocks — general lesson types, the
// per-question-type lessons, and the JLPT ladder — with extra spacing
// between each (see .practice-page__list's gap vs .practice-page__group's)
// so each reads as its own progression rather than just more items in the
// same list. QUESTION_TYPE_LESSON_TYPES is hand-listed (it mirrors the
// backend's QUESTION_TYPE_VARIANTS — see lessonTypeMetadata.js's comment on
// those entries) since there's no shared prefix to derive it from the way
// JLPT_LESSON_TYPES is; GENERAL_LESSON_TYPES is just "everything else"
// so a newly added general lesson type doesn't need this list touched too.
const JLPT_LESSON_TYPES = ALL_LESSON_TYPES.filter((lessonType) => lessonType.startsWith('jlpt_'));
const QUESTION_TYPE_LESSON_TYPES = [
  'word_choice',
  'reading_choice',
  'meaning_choice',
  'reading_spelling',
  'reading_typing',
  'word_wheel',
];
const GENERAL_LESSON_TYPES = ALL_LESSON_TYPES.filter(
  (lessonType) => !JLPT_LESSON_TYPES.includes(lessonType) && !QUESTION_TYPE_LESSON_TYPES.includes(lessonType)
);
const LESSON_TYPE_GROUPS = [GENERAL_LESSON_TYPES, QUESTION_TYPE_LESSON_TYPES, JLPT_LESSON_TYPES];

// N5 stays free for everyone (see the backend's planAccess.js) — only the
// JLPT levels above it are gated, so this is JLPT_LESSON_TYPES minus N5
// rather than a second hand-maintained list.
const FREE_JLPT_TYPE = `jlpt_${FREE_JLPT_LEVEL.toLowerCase()}`;
const PRO_ONLY_LESSON_TYPES = JLPT_LESSON_TYPES.filter((lessonType) => lessonType !== FREE_JLPT_TYPE);

// Unlike the home page's tile row (a per-user-unlocked subset, weight-
// sampled down to a handful of suggestions), this always lists every known
// lesson type — it's the "start anything, any time" list, not a
// recommendation. Starting a lesson from here navigates straight to
// /lesson with the chosen type in location.state (see Quiz.jsx's
// bonusLessonType), skipping the home page's lesson-choice selection call
// entirely — so it doesn't count as picking one of the day's suggested
// options, but the lesson itself still generates real rounds and scores
// normally once completed.
export function PracticePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const canAccessAllLevels = hasFullAccess(user);

  function startLesson(lessonType) {
    navigate('/lesson', { state: { lessonType, returnTo: location.pathname } });
  }

  return (
    <>
      <Helmet>
        <title>Practice</title>
      </Helmet>
      <div className="practice-page">
        <header className="practice-page__header">
          <Link to="/home" className="practice-page__back" aria-label="Back to home">
            <IoArrowBack />
          </Link>
          <h1 className="practice-page__title">Practice</h1>
          <OverflowMenu currentPage="practice" className="practice-page__menu" />
        </header>

        <div className="practice-page__content">
          <div className="practice-page__list">
            {LESSON_TYPE_GROUPS.map((group, index) => (
              <div className="practice-page__group" key={index}>
                {group.map((lessonType) => {
                  const { icon, title, subtitle } = LESSON_METADATA_BY_LESSON_TYPE[lessonType];
                  const isLocked = PRO_ONLY_LESSON_TYPES.includes(lessonType) && !canAccessAllLevels;
                  return (
                    <button
                      key={lessonType}
                      type="button"
                      className={cx('practice-card', `practice-card--${lessonType}`, isLocked && 'practice-card--locked')}
                      onClick={() => startLesson(lessonType)}
                      disabled={isLocked}
                    >
                      <span className="practice-card__icon">{icon}</span>
                      <span className="practice-card__info">
                        <span className="practice-card__title">{title}</span>
                        <span className="practice-card__subtitle">{isLocked ? 'Upgrade to unlock' : subtitle}</span>
                      </span>
                      {isLocked && <IoLockClosed className="practice-card__lock" aria-label="Requires upgrade" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
