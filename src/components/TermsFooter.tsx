/**
 * ESPN-style terms and conditions footer.
 * Structure mirrors espn.com footer links.
 */
export function TermsFooter() {
  return (
    <footer className="terms-footer" role="contentinfo">
      <div className="terms-footer-inner">
        <nav className="terms-nav" aria-label="Legal and support">
          <a href="https://espn.com" className="terms-link">Terms of Use</a>
          <span className="terms-sep">|</span>
          <a href="https://espn.com" className="terms-link">Privacy Policy</a>
          <span className="terms-sep">|</span>
          <a href="https://espn.com" className="terms-link">Your California Privacy Rights</a>
          <span className="terms-sep">|</span>
          <a href="https://espn.com" className="terms-link">Interest-Based Ads</a>
          <span className="terms-sep">|</span>
          <a href="https://espn.com" className="terms-link">Closed Captioning</a>
        </nav>
        <p className="terms-copyright">
          © {new Date().getFullYear()} ESPN. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
