/**
 * Professional banner ad — IAB standard dimensions and best practices.
 * - Desktop: Leaderboard 728×90 (IAB standard)
 * - Mobile: Mobile Leaderboard 320×50 (IAB standard)
 * - Ad disclosure, single CTA, accessible.
 */
export function BannerAd() {
  return (
    <aside
      className="banner-ad"
      aria-label="Advertisement"
      role="complementary"
    >
      <span className="banner-ad-disclosure" aria-hidden="true">
        Ad
      </span>
      <div className="banner-ad-container">
        <a
          href="https://www.draftkings.com"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="banner-ad-link"
        >
          <span className="banner-ad-brand">DraftKings</span>
          <span className="banner-ad-headline">Get in the game. Bet on NFL.</span>
          <span className="banner-ad-cta">Sign up</span>
        </a>
      </div>
    </aside>
  );
}
