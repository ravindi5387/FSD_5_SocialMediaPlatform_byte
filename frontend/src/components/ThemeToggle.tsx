import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';
  return (
    <button className="icon-button theme-toggle" onClick={toggleTheme} title={`Switch to ${next} mode`} aria-label={`Switch to ${next} mode`}>
      {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
    </button>
  );
}
