import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';  // розширюйте, якщо додасте теми

interface ThemeCtx {
    theme: Theme;
    setTheme(theme: Theme): void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(
        (localStorage.getItem('theme') as Theme) || 'light'
    );

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem('theme', t);
        document.documentElement.setAttribute('data-theme', t);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
