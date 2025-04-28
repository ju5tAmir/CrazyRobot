import {KEYS} from "../KEYS";

interface ClientIdHook{
   getClientId:()=>string|null,
   generateClientId:()=>string,
   checkIdExist:(string:KEYS)=>boolean
}


export const useClientIdState=(key:string):ClientIdHook=>{
    const generateClientId = (): string => {
        return crypto.randomUUID();
    };

    const getClientId =  (): string => {
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

    return{getClientId,generateClientId,checkIdExist}
}
