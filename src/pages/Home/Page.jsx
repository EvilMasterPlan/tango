import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '@/pages/Home/Page.scss';

const TRACK = {
  depth: 5,
  choices: [
    { depth: 10, type: 'star' },
    { depth: 18, type: 'gem' },
    { depth: 12, type: 'fire' },
  ],
};

const TYPE_EMOJI = {
  star: '⭐',
  gem: '💎',
  fire: '🔥',
};

const DEPTH_MARKS = ['5m', '10m', '20m', '50m'];

function TrackPipe() {
  return (
    <svg className="home-track__connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <line x1="50" y1="0" x2="50" y2="100" />
    </svg>
  );
}

function TrackElbowLeft() {
  return (
    <svg className="home-track__connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <polyline points="115,50 50,50 50,100" />
    </svg>
  );
}

function TrackElbowRight() {
  return (
    <svg className="home-track__connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <polyline points="-15,50 50,50 50,100" />
    </svg>
  );
}

function TrackForkCenter({ count }) {
  if (count === 1) return <TrackPipe />;
  return (
    <svg className="home-track__connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <line x1="50" y1="0" x2="50" y2="50" />
      <line x1="-15" y1="50" x2="115" y2="50" />
      {count === 3 && <line x1="50" y1="50" x2="50" y2="100" />}
    </svg>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { choices } = TRACK;
  const count = choices.length;
  const hasFork = count > 1;

  const slots =
    count === 1
      ? [null, choices[0], null]
      : count === 2
        ? [choices[0], null, choices[1]]
        : choices;

  return (
    <>
      <Helmet>
        <title>Tanuki Tango</title>
        <meta name="description" content="Tanuki Tango — Japanese learning track." />
      </Helmet>

      <div className="home-track">
        <div className="home-track__depth" aria-hidden>
          {DEPTH_MARKS.map((mark) => (
            <span key={mark} className="home-track__depth-mark">
              <span className="home-track__depth-tick" />
              <span className="home-track__depth-label">{mark}</span>
            </span>
          ))}
        </div>

        <div className="home-track__grid">
          {/* Row 0: pipe arriving at current position */}
          <div aria-hidden />
          <TrackPipe />
          <div aria-hidden />

          {/* Row 1: current position */}
          <div aria-hidden />
          <div className="home-track__room home-track__room--current">{'( •̀ω•́ )'}</div>
          <div aria-hidden />

          {/* Row 2: fork connectors */}
          {hasFork ? <TrackElbowLeft /> : <div aria-hidden />}
          <TrackForkCenter count={count} />
          {hasFork ? <TrackElbowRight /> : <div aria-hidden />}

          {/* Row 3: choice rooms */}
          {slots.map((choice, i) =>
            choice ? (
              <button
                key={'ch-' + i}
                type="button"
                className={`home-track__room home-track__room--action home-track__room--${choice.type}`}
                onClick={() => navigate('/lesson')}
              >
                {TYPE_EMOJI[choice.type]}
              </button>
            ) : (
              <div key={'ch-' + i} aria-hidden />
            ),
          )}

          {/* Row 4: pipes departing from choices */}
          {slots.map((choice, i) =>
            choice ? <TrackPipe key={'p-' + i} /> : <div key={'p-' + i} aria-hidden />,
          )}
        </div>
      </div>
    </>
  );
}
