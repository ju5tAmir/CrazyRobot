import {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { http } from '../../helpers/http.ts';


interface AuthContextType {
    jwt: string | null;
    login(email: string, password: string): Promise<void>;
    loginOrRegisterUser(email: string): Promise<void>;
    logout(): void;
}

const AuthContext = createContext<AuthContextType>(null as never);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [jwt, setJwt] = useState<string | null>(
        localStorage.getItem('jwt')
    );

    useEffect(() => {
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
        <AuthContext.Provider value={{ jwt, login, loginOrRegisterUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
