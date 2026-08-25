import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '@/pages/Marketing/Page.scss';

export function MarketingPage() {
  return (
    <>
      <Helmet>
        <title>Tanuki Tango — Japanese Vocabulary Drills</title>
        <meta name="description" content="Master Japanese vocabulary through focused, spaced-repetition drilling." />
      </Helmet>

      <div className="marketing">
        <div className="marketing__inner">
          <header className="marketing__header">
            <span className="marketing__wordmark">Tanuki Tango</span>
          </header>

          <main className="marketing__body">
            <h1 className="marketing__headline">Drill Japanese vocabulary, one word at a time.</h1>
            <p className="marketing__sub">
              Tanuki Tango keeps you on track with targeted quizzes, spaced repetition, and instant
              feedback — so the words actually stick.
            </p>

            <ul className="marketing__features" aria-label="Key features">
              <li className="marketing__feature">Kanji, kana, and meaning — tested every way</li>
              <li className="marketing__feature">Spaced repetition keeps weak vocab front and centre</li>
              <li className="marketing__feature">Short drills you can finish in under five minutes</li>
            </ul>

            <Link to="/account/signup" className="btn btn-primary marketing__cta">
              Get started — it's free
            </Link>

            <p className="marketing__signin">
              Already have an account?{' '}
              <Link to="/account/login" className="marketing__signin-link">
                Sign in
              </Link>
            </p>
          </main>
        </div>
      </div>
    </>
  );
}
