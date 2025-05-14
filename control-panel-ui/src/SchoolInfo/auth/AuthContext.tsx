import {createContext, useState, ReactNode, useEffect} from 'react';
import { http } from '../../helpers/http.ts';


interface AuthContextType {
    jwt: string | null;
    role: string | null;
    login(email: string, password: string): Promise<void>;
    loginOrRegisterUser(email: string): Promise<void>;
    logout(): void;
}

export const AuthContext = createContext<AuthContextType>(null as never);

interface JwtPayload {
    sub: string;
    role?: string;
    exp: number;
    [key: string]: string | number | boolean | undefined;
}

function decodeJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT', error);
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [jwt, setJwt] = useState<string | null>(
        localStorage.getItem('jwt')
    );
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        if (jwt) {
            const payload = decodeJwt(jwt);
            if (payload) {
                setRole(payload.role || null);
            }
        } else {
            setRole(null);
        }
        http.resetClients();
    }, [jwt]);

    async function login(email: string, password: string) {
        const { jwt: token } = await http.auth.login({ email, password });
        localStorage.setItem('jwt', token);
        setJwt(token);
    }

    async function loginOrRegisterUser(email: string) {
        const { jwt: token } = await http.auth.loginOrRegisterUser({ email, role: 'user' });
        localStorage.setItem('jwt', token);
        setJwt(token);
    }

    function logout() {
        localStorage.removeItem('jwt');
        setJwt(null);
        http.resetClients();
    }

    return (
        <AuthContext.Provider value={{ jwt, role, login, loginOrRegisterUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
