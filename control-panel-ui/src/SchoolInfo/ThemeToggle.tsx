import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext.tsx';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const next = theme === 'light' ? 'dark' : 'light';

    return (
        <button
            className="btn btn-circle"
            onClick={() => setTheme(next)}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <Moon /> : <Sun />}
        </button>
    );
}
