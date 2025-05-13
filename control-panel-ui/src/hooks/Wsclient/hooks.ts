import { v4 as uuidv4 } from 'uuid';
import { KEYS } from "../KEYS";

interface ClientIdHook {
    getClientId: () => string | null;
    generateClientId: () => string;
    checkIdExist: (key: KEYS) => boolean;
}

export const useClientIdState = (key: string): ClientIdHook => {
    const generateClientId = (): string => {

        return (crypto as any).randomUUID?.() ?? uuidv4();
    };

    const getClientId = (): string => {
        let clientId = sessionStorage.getItem(key);
        if (!clientId) {
            clientId = generateClientId();
            sessionStorage.setItem(key, clientId);
        }
        return clientId;
    };

    const checkIdExist = (): boolean => {
        return sessionStorage.getItem(key) !== null;
    };

    return { getClientId, generateClientId, checkIdExist };
};