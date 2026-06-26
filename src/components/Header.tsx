interface HeaderProps {
  dark: boolean;
  onToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ dark, onToggle }) => {
  return (
    <header>
      <div className="header-inner">
        <div className="header-text">
          <h1>🎙️ Read Aloud</h1>
          <p>Read the text aloud for lazy people</p>
        </div>
        <button className="theme-btn" onClick={onToggle} title="Toggle theme">
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
};