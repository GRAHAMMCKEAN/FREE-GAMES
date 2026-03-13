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
      <div className="banner-ad-container banner-ad-spotify">
        <a
          href="https://www.spotify.com"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="banner-ad-link"
        >
          <span className="banner-ad-brand">Spotify</span>
          <span className="banner-ad-headline">Music and podcasts for everyone. Listen free.</span>
          <span className="banner-ad-cta">Get Spotify Free</span>
        </a>
      </div>
    </aside>
  );
}
