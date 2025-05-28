import { atom } from 'jotai';
import { KEYS } from '../hooks/KEYS';

interface User {
    isLoggedIn: boolean;
    role: string;
}

const internalUserAtom = atom<User>({
    isLoggedIn: sessionStorage.getItem(KEYS.USER_LOGGED) === 'true',
    role: sessionStorage.getItem(KEYS.USER_ROLE) || '',
});

export const CheckUserLogged= atom(
    (get) => get(internalUserAtom),
    /* @ts-expect-error lskjdf */
    (get, set, newUser: User) => {
        sessionStorage.setItem(KEYS.USER_LOGGED, String(newUser.isLoggedIn));
        sessionStorage.setItem(KEYS.USER_ROLE, newUser.role);
        set(internalUserAtom, newUser);
    }
);
