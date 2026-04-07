// ============ THEME MANAGEMENT SYSTEM ============

const THEME_KEY = 'gb_theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

const ThemeManager = {
  getCurrentTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }
    return THEMES.LIGHT;
  },

  setTheme(theme) {
    if (!Object.values(THEMES).includes(theme)) return;
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === THEMES.DARK) {
      this.applyDarkTheme();
    } else {
      this.applyLightTheme();
    }
  },

  applyDarkTheme() {
    const root = document.documentElement;
    root.style.setProperty('--blue', '#5b9fff');
    root.style.setProperty('--blue-dark', '#4a7fcc');
    root.style.setProperty('--blue-light', '#1a3a5c');
    root.style.setProperty('--white', '#1a1a1a');
    root.style.setProperty('--green', '#66bb6a');
    root.style.setProperty('--green-light', '#1b5e20');
    root.style.setProperty('--text', '#ffffff');
    root.style.setProperty('--text-muted', '#b0b0b0');
    root.style.setProperty('--border', '#333333');
    root.style.setProperty('--card-bg', '#2d2d2d');
    root.style.setProperty('--shadow', '0 4px 24px rgba(0,0,0,0.3)');
    root.style.setProperty('--shadow-lg', '0 12px 48px rgba(0,0,0,0.5)');
  },

  applyLightTheme() {
    const root = document.documentElement;
    root.style.setProperty('--blue', '#2F80ED');
    root.style.setProperty('--blue-dark', '#1a5fc8');
    root.style.setProperty('--blue-light', '#e8f1fd');
    root.style.setProperty('--white', '#F5F7FA');
    root.style.setProperty('--green', '#27AE60');
    root.style.setProperty('--green-light', '#e8f7ee');
    root.style.setProperty('--text', '#1a2340');
    root.style.setProperty('--text-muted', '#6b7a99');
    root.style.setProperty('--border', '#dde4f0');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--shadow', '0 4px 24px rgba(47,128,237,0.10)');
    root.style.setProperty('--shadow-lg', '0 12px 48px rgba(47,128,237,0.18)');
  },

  toggleTheme() {
    const current = this.getCurrentTheme();
    const next = current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.setTheme(next);
    return next;
  },

  getThemeToggleButton() {
    const theme = this.getCurrentTheme();
    const icon = theme === THEMES.DARK ? '☀️' : '🌙';
    const title = theme === THEMES.DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    return `<button class="theme-toggle-btn" id="theme-toggle" onclick="ThemeManager.toggleTheme()" title="${title}" style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.5rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease; width: 40px; height: 40px;">${icon}</button>`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const theme = ThemeManager.getCurrentTheme();
  ThemeManager.applyTheme(theme);
});

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      ThemeManager.applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    }
  });
}