import { FeatureCard } from '@/components/FeatureCard';
import { StatCard } from '@/components/StatCard';

export function Home() {
  return (
    <>
      <section className="hero">
        <h2 className="hero-title">Ready to master Japanese?</h2>
        <p className="hero-description">
          Track your progress, practice kanji, and prepare for the JLPT with personalized study plans.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary">Start Learning</button>
          <button className="btn">View Progress</button>
        </div>
      </section>

      <section className="features">
        <h3 className="section-title">What you can do</h3>
        <div className="grid grid-cols-3">
          <FeatureCard
            icon="📖"
            title="Kanji Reading"
            description="Master on-yomi and kun-yomi readings for JLPT vocabulary"
            route="/vocab/reading"
          />
          <FeatureCard
            icon="✍️"
            title="Orthography"
            description="Learn correct kanji stroke order and character forms"
            route="/vocab/orthography"
          />
          <FeatureCard
            icon="💭"
            title="Contextually Defined Expressions"
            description="Understand expressions in their proper context"
            route="/vocab/expressions"
          />
        </div>
        <div className="grid grid-cols-3" style={{ marginTop: 'var(--space-lg)' }}>
          <FeatureCard
            icon="🔄"
            title="Paraphrasing"
            description="Practice expressing ideas in different ways"
            route="/vocab/paraphrasing"
          />
          <FeatureCard
            icon="🎯"
            title="Kanji Focus"
            description="Practice individual kanji characters in isolation"
            route="/vocab/focus"
          />
        </div>
      </section>

      <section className="quick-stats">
        <h3 className="section-title">Your Progress</h3>
        <div className="grid grid-cols-2">
          <StatCard number={0} label="Kanji Mastered" />
          <StatCard number={0} label="Study Sessions" />
        </div>
      </section>
    </>
  );
} 