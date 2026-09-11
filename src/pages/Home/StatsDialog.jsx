import { useNavigate } from 'react-router-dom';
import { CoinIcon } from '@/components/quiz/summary/CoinIcon';
import { GEM_HUES, MasteryGemIcon } from '@/components/shared/MasteryGemIcon';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { jlptGemColor } from '@/utils/jlptGemColor';
import './StatsDialog.scss';

// Opened from the home header's coins/gem section — a breakdown of the
// user's overall coin total plus, per JLPT level, how many of that level's
// words they've discovered (attempted at least once) out of the level's
// total pool size, as a color-coded progress bar. `jlptLevels` is
// `useOverallStats`'s own array (see Home/Page.jsx), already in ascending
// N5-N1 order straight from the API.
export function StatsDialog({ points, jlptLevels, onClose }) {
  const navigate = useNavigate();

  return (
    <Modal title="Your Progress" onClose={onClose} className="stats-dialog">
      <div className="stats-dialog__row">
        <CoinIcon />
        <span className="stats-dialog__label">{points}</span>
      </div>
      {jlptLevels.map(({ level, wordsDiscovered, totalWords }) => {
        const hue = GEM_HUES[jlptGemColor(level)];
        const percent = totalWords > 0 ? Math.min(100, (wordsDiscovered / totalWords) * 100) : 0;
        return (
          <div className="stats-dialog__row" key={level}>
            <MasteryGemIcon className="stats-dialog__gem-icon" color={jlptGemColor(level)} />
            <span className="stats-dialog__level-label">{level}</span>
            <div className="stats-dialog__bar-track">
              <div className="stats-dialog__bar-fill" style={{ width: `${percent}%`, backgroundColor: `hsl(${hue}, 65%, 45%)` }} />
              <span className="stats-dialog__bar-label">
                {wordsDiscovered} / {totalWords}
              </span>
            </div>
          </div>
        );
      })}
      <Button className="stats-dialog__achievements-button" variant="secondary" onClick={() => navigate('/overview?mode=achievement')}>
        See Achievements
      </Button>
    </Modal>
  );
}
