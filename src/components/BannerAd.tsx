/**
 * Banner ad — DraftKings (sports gaming / fantasy)
 */
export function BannerAd() {
  return (
    <aside className="banner-ad banner-ad--draftkings" aria-label="DraftKings">
      <a
        href="https://www.draftkings.com"
        target="_blank"
        rel="noopener noreferrer"
        className="banner-ad-link"
      >
        <span className="banner-ad-brand">DraftKings</span>
        <span className="banner-ad-headline">Get in the game. Bet on NFL.</span>
        <span className="banner-ad-cta">Sign up</span>
      </a>
    </aside>
  );
}
