import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './Home.scss';

export function Home() {
  return (
    <>
      <Helmet>
        <title>SarabaJa - Japanese Learning Platform</title>
        <meta name="description" content="Master Japanese kanji, vocabulary, and JLPT preparation with personalized study plans." />
      </Helmet>
      
      <section className="home-container">
        <h1 className="home-title">Japanese Learning Path</h1>
        
        <div className="sections-container">
          {/* Targeted Practice Section */}
          <div className="section-card">
            <h2 className="section-title">Targeted Practice</h2>
            <div className="section-items">
              <div className="section-item">
                <span className="item-label">Vocab</span>
                <Link to="/vocab/focus" className="section-link">
                  Kanji Focus
                </Link>
              </div>
              <div className="section-item">
                <span className="item-label">Kanji</span>
                <span className="coming-soon">Coming soon</span>
              </div>
            </div>
          </div>

          {/* JLPT Simulation Section */}
          <div className="section-card">
            <h2 className="section-title">JLPT Simulation</h2>
            
            {/* Vocab subsection */}
            <div className="subsection">
              <h3 className="subsection-title">Vocab</h3>
              <div className="subsection-items">
                <div className="subsection-item">Kanji Reading</div>
                <div className="subsection-item">Reverse Kanji Reading</div>
                <div className="subsection-item">Fill in the Blank</div>
                <div className="subsection-item">Similar Sentences</div>
                <div className="subsection-item">Word Placement</div>
              </div>
            </div>

            {/* Reading subsection */}
            <div className="subsection">
              <h3 className="subsection-title">Reading</h3>
              <div className="subsection-items">
                <div className="subsection-item">Conjugation</div>
                <div className="subsection-item">Ordering</div>
                <div className="subsection-item">Fill in the Blank</div>
                <div className="subsection-item">Comprehension</div>
                <div className="subsection-item">Super Comprehension</div>
                <div className="subsection-item">Combination</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
