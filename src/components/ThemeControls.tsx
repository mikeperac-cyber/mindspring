import { useAppStore } from '../app/store';
import { themes } from '../app/theme';

export function ThemeCycleButton() {
  const { theme, setTheme } = useAppStore();
  const index = themes.findIndex((option) => option.id === theme);
  const current = themes[index];
  const next = themes[(index + 1) % themes.length];

  return (
    <button
      className="theme-cycle"
      type="button"
      title={`Switch to ${next.name} theme`}
      aria-label={`Theme: ${current.name}. Switch to ${next.name}`}
      onClick={() => setTheme(next.id)}
    >
      <span className="theme-cycle-icon" aria-hidden="true">◐</span>
      <span>Theme: {current.name}</span>
    </button>
  );
}

export function ThemeChooser() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="theme-options" role="radiogroup" aria-label="Choose a color theme">
      {themes.map((option) => (
        <label
          key={option.id}
          className={`theme-option theme-option-${option.id}${theme === option.id ? ' selected' : ''}`}
        >
          <input
            className="theme-option-input"
            type="radio"
            name="color-theme"
            value={option.id}
            checked={theme === option.id}
            onChange={() => setTheme(option.id)}
          />
          <span className="theme-option-preview" aria-hidden="true">
            <span className="theme-option-preview-card" />
            <span className="theme-option-preview-dot" />
          </span>
          <span className="theme-option-copy">
            <strong>{option.name}</strong>
            <small>{option.description}</small>
          </span>
          <span className="theme-option-check" aria-hidden="true">{theme === option.id ? '✓' : ''}</span>
        </label>
      ))}
    </div>
  );
}
