import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthClient } from '../../api/generated-client'; // або '@/api/generated-client'

interface AuthContextType {
    jwt: string | null;
    login(email: string, password: string): Promise<void>;
    logout(): void;
}

const AuthContext = createContext<AuthContextType>(null as never);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [jwt, setJwt] = useState<string | null>(
        localStorage.getItem('jwt')
    );

    async function login(email: string, password: string) {
        const client = new AuthClient(import.meta.env.VITE_API_BASE_URL);
        const { jwt: token } = await client.login({ email, password });
        localStorage.setItem('jwt', token);
        setJwt(token);
    }

    function logout() {
        localStorage.removeItem('jwt');
        setJwt(null);
    }

    return (
        <AuthContext.Provider value={{ jwt, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
