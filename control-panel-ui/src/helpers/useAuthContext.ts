import {createContext} from "react";

interface AuthContextType {
    jwt: string | null;
    role: string | null;
    login(email: string, password: string): Promise<void>;
    loginOrRegisterUser(email: string, username: string): Promise<void>;
    logout(): void;
}

export const AuthContext = createContext<AuthContextType>(null as never);
