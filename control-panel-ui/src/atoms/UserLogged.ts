import {atom} from "jotai";
import {KEYS} from "../hooks/KEYS";

const getInitialLoggedState = (): boolean => {
    const stored = sessionStorage.getItem(KEYS.USER_LOGGED);
    return stored === 'true';
};

export const CheckUserLogged = atom(
    getInitialLoggedState(), // initial value from sessionStorage
    (get, set, newValue: boolean) => {
        sessionStorage.setItem(KEYS.USER_LOGGED, String(newValue));
        set(CheckUserLogged, newValue);
    }
);