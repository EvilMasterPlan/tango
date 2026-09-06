import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { ALL_LESSON_TYPES, LESSON_METADATA_BY_LESSON_TYPE } from '@/utils/lessonTypeMetadata';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import '@/pages/Practice/Page.scss';

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

  function startLesson(lessonType) {
    navigate('/lesson', { state: { lessonType } });
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
            {ALL_LESSON_TYPES.map((lessonType) => {
              const { icon, title, subtitle } = LESSON_METADATA_BY_LESSON_TYPE[lessonType];
              return (
                <button
                  key={lessonType}
                  type="button"
                  className={cx('practice-card', `practice-card--${lessonType}`)}
                  onClick={() => startLesson(lessonType)}
                >
                  <span className="practice-card__icon">{icon}</span>
                  <span className="practice-card__info">
                    <span className="practice-card__title">{title}</span>
                    <span className="practice-card__subtitle">{subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
