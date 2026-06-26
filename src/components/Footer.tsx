export const Footer = () => {
  const year: number = new Date().getFullYear();

  return (
    <footer>
      <span>Made with ♥️ by Luis Arias</span>
      <span className="footer-sep">·</span>
      <span>© {year} All rights reserved</span>
      <span className="footer-sep">·</span>
      <a
        href="https://github.com/ariassd/read-aloud-for-lazy-people"
        target="_blank"
        rel="noopener noreferrer"
        className="gh-link"
        title="View on GitHub"
      >
        <img alt="gh" src="/public/github.svg" width="24px" />
      </a>
    </footer>
  );
};