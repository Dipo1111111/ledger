import { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
  onStartGame: () => void;
}

export function LandingPage({ onStartGame }: LandingPageProps) {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [showBoard, setShowBoard] = useState(false);

  /* IntersectionObserver for scroll-reveal.
     Ref is on the outermost container so ALL sections are watched. */
  useEffect(() => {
    const root = sectionsRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll('.lr');
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('v');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -40px 0px' },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  /* Stagger the game board entrance */
  useEffect(() => {
    const id = setTimeout(() => setShowBoard(true), 300);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="min-h-dvh bg-felt-dark" ref={sectionsRef}>

      {/* ═══════════════════════════════════════════════════
          HERO — unchanged
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-dvh flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-gold/[0.03] to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-felt-dark to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-0">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

            {/* Left — text */}
            <div>
              <h1
                className="font-serif text-[clamp(2.6rem,5.5vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.02em] text-white mb-6"
                style={{ textWrap: 'balance' }}
              >
                Build an Empire.
                <br />
                <span className="text-gold">Break the Competition.</span>
              </h1>

              <p className="text-[0.95rem] lg:text-lg text-cream/50 leading-relaxed max-w-md mb-10">
                Buy assets, orchestrate hostile takeovers, and bankrupt your rivals.
                No dice. No chance cards. Every victory is earned through decisions.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onStartGame}
                  className="landing-cta-glow inline-flex items-center gap-2.5 rounded-[var(--radius-btn)] bg-gold px-8 py-3.5 text-sm font-bold text-felt-dark tracking-wide transition-all duration-200 hover:bg-gold-light hover:-translate-y-0.5 hover:shadow-[var(--shadow-btn-accent)] active:translate-y-0 active:scale-[0.98]"
                >
                  Take a Seat
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-cream/10 px-6 py-3 text-sm font-medium text-cream/45 transition-all duration-200 hover:border-cream/20 hover:text-cream/70 cursor-pointer"
                >
                  How to Play
                </button>
              </div>

              {/* Trust strip */}
              <div className="flex items-center gap-6 mt-12">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-gold">2-6</span>
                  <span className="text-[0.65rem] text-cream/30 uppercase tracking-wider">Players</span>
                </div>
                <div className="w-px h-4 bg-cream/10" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-gold">30-60</span>
                  <span className="text-[0.65rem] text-cream/30 uppercase tracking-wider">Minutes</span>
                </div>
                <div className="w-px h-4 bg-cream/10" />
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] text-cream/30 uppercase tracking-wider">Browser-based, no download</span>
                </div>
              </div>
            </div>

            {/* Right — real game screenshot */}
            <div
              className={`hidden lg:block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                showBoard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 32px 80px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.50 0.06 200 / 0.12)' }}>
                <img
                  src="/game-screenshot.png"
                  alt="Ledger game board showing three players competing with market cards and portfolio management"
                  className="w-full h-auto block"
                  width={720}
                  height={450}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-felt-dark to-transparent pointer-events-none" />
      </section>


      {/* ═══════════════════════════════════════════════════
          DIFFERENTIATION — two-column "Them / Us"
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">

          {/* Dramatic heading */}
          <div className="lr mb-16 lg:mb-20 text-center">
            <h2
              className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-bold text-white leading-[1.08] tracking-[-0.01em]"
              style={{ textWrap: 'balance' }}
            >
              Not Monopoly. Not Poker.
              <br />
              <span className="text-gold">Something sharper.</span>
            </h2>
          </div>

          {/* Two-column comparison */}
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-0 lg:gap-0 max-w-5xl mx-auto">
            {/* Them column */}
            <div className="flex flex-col gap-6 lg:pr-10">
              {[
                'Dice rolls decide your fate',
                'Single hand, no empire',
                'Match-three simplicity',
                'Games that never end',
              ].map((text, i) => (
                <div
                  key={text}
                  className="lr flex items-center gap-4"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-danger/15 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-danger/60">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </span>
                  <span className="text-[0.9rem] text-cream/30 leading-snug">{text}</span>
                </div>
              ))}
            </div>

            {/* Gold center divider */}
            <div className="hidden lg:flex flex-col items-center py-2 mx-4">
              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
            </div>

            {/* Us column */}
            <div className="flex flex-col gap-6 lg:pl-10">
              {[
                'Zero randomness, full strategy',
                'Build corporations, not just hands',
                'Takeovers, auctions, and betrayal',
                '30-60 minutes, decisive endings',
              ].map((text, i) => (
                <div
                  key={text}
                  className="lr flex items-center gap-4"
                  style={{ transitionDelay: `${i * 80 + 120}ms` }}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-gold">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-[0.9rem] text-cream/80 leading-snug font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS — four escalating phases
          ═══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-20 lg:py-32">
        {/* Background gradient — distinct atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-felt-light/30 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-12">
          <div className="lr mb-14 lg:mb-20 text-center">
            <h2
              className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              How to win
            </h2>
          </div>

          {/* Four phases */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {[
              {
                num: '01',
                title: 'Acquire',
                desc: 'Buy corporate assets from the open market. Each card is an investment that generates income, but also incurs taxes.',
                suit: 'king',
                accent: 'gold',
              },
              {
                num: '02',
                title: 'Leverage',
                desc: 'Borrow from the bank or invest in rival corporations. Every credit spent is a calculated risk.',
                suit: 'diamond',
                accent: 'warning',
              },
              {
                num: '03',
                title: 'Strike',
                desc: 'Launch hostile takeovers. Auction assets at premium prices. Betray allies when the timing is right.',
                suit: 'spade',
                accent: 'danger',
              },
              {
                num: '04',
                title: 'Dominate',
                desc: 'Outlast every rival. The last corporation standing wins. No dice, no luck, just decisions.',
                suit: 'heart',
                accent: 'cream',
              },
            ].map((phase, i) => (
              <div
                key={phase.num}
                className="lr phase-card group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Phase accent strip */}
                <div className={`h-1 rounded-full mb-5 ${
                  phase.accent === 'gold' ? 'bg-gold/60' :
                  phase.accent === 'warning' ? 'bg-warning/50' :
                  phase.accent === 'danger' ? 'bg-danger/50' :
                  'bg-cream/15'
                }`} />

                {/* Phase number + suit icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[0.65rem] font-bold text-gold/50 tracking-wider">
                    {phase.num}
                  </span>
                  <span className={`text-lg opacity-40 ${
                    phase.suit === 'king' ? 'text-gold' :
                    phase.suit === 'diamond' ? 'text-diamond' :
                    phase.suit === 'spade' ? 'text-spade' :
                    'text-heart'
                  }`}>
                    {phase.suit === 'king' ? '♚' :
                     phase.suit === 'diamond' ? '♦' :
                     phase.suit === 'spade' ? '♠' : '♥'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl font-bold text-white mb-2.5">
                  {phase.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-cream/45 leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════
          EVIDENCE — pull-quote statement + supporting facts
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">

          {/* Big statement */}
          <div className="lr mb-16 lg:mb-20 max-w-3xl">
            <p
              className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-cream/80 leading-snug"
              style={{ textWrap: 'balance' }}
            >
              Strategy games don't just entertain.{' '}
              <span className="text-gold">They sharpen the mind.</span>
            </p>
          </div>

          {/* Supporting facts — staggered */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 max-w-4xl">
            <div className="lr" style={{ transitionDelay: '80ms' }}>
              <h3 className="font-serif text-lg font-bold text-white mb-3">
                Better financial decisions
              </h3>
              <p className="text-sm text-cream/45 leading-relaxed">
                Research from the Harvard Business Review found that people who regularly play
                strategy-based financial games show improved decision-making under uncertainty.
                Ledger mirrors the same cognitive patterns used in real-world financial planning.
              </p>
            </div>

            <div className="lr" style={{ transitionDelay: '160ms' }}>
              <h3 className="font-serif text-lg font-bold text-white mb-3">
                Negotiation builds empathy
              </h3>
              <p className="text-sm text-cream/45 leading-relaxed">
                Studies in behavioral psychology show that negotiation-based play activates
                the prefrontal cortex, the brain's center for strategic planning and
                perspective-taking. When you negotiate a deal in Ledger, you're reading
                another player's position and finding mutually beneficial outcomes.
              </p>
            </div>

            <div className="lr" style={{ transitionDelay: '240ms' }}>
              <h3 className="font-serif text-lg font-bold text-white mb-3">
                Financial literacy through play
              </h3>
              <p className="text-sm text-cream/45 leading-relaxed">
                Traditional financial education is abstract. Ledger makes it visceral.
                When you default on a loan and face emergency liquidation, you feel the
                consequence of over-leveraging. That's a lesson no textbook delivers.
              </p>
            </div>

            <div className="lr" style={{ transitionDelay: '320ms' }}>
              <h3 className="font-serif text-lg font-bold text-white mb-3">
                Social intelligence
              </h3>
              <p className="text-sm text-cream/45 leading-relaxed">
                Reading bluffs, timing betrayals, building alliances that serve your interests.
                Every negotiation is a live exercise in reading people, assessing risk, and
                making decisions under pressure with real stakes.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════
          FINAL CTA — atmospheric close
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-40 overflow-hidden">
        {/* Atmospheric glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="lr">
            <h2
              className="font-serif text-[clamp(2rem,4.5vw,3.4rem)] font-bold text-white leading-[1.1] tracking-[-0.01em] mb-5"
              style={{ textWrap: 'balance' }}
            >
              The table is set.
            </h2>
            <p className="text-[0.95rem] text-cream/40 mb-10 max-w-lg mx-auto leading-relaxed">
              Gather your rivals. Take your seat. Build the empire that outlasts them all.
            </p>
            <button
              onClick={onStartGame}
              className="landing-cta-glow inline-flex items-center gap-2.5 rounded-[var(--radius-btn)] bg-gold px-9 py-4 text-sm font-bold text-felt-dark tracking-wide transition-all duration-200 hover:bg-gold-light hover:-translate-y-0.5 hover:shadow-[var(--shadow-btn-accent)] active:translate-y-0 active:scale-[0.98]"
            >
              Start Playing
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-[0.65rem] text-cream/20 mt-6">
              2-6 players &middot; 30-60 minutes &middot; Browser-based, no download
            </p>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════
          FOOTER — minimal
          ═══════════════════════════════════════════════════ */}
      <footer className="border-t border-cream/[0.05] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-gold-dark/20 border border-gold-dark/25 flex items-center justify-center">
              <span className="font-serif text-[0.55rem] font-bold text-gold-dark/80">L</span>
            </div>
            <span className="font-serif text-xs font-semibold text-cream/30">Ledger</span>
          </div>
          <p className="text-[0.65rem] text-cream/20">
            A multiplayer strategy card game
          </p>
        </div>
      </footer>
    </div>
  );
}
