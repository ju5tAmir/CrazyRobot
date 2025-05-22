import { v4 as uuidv4 } from 'uuid';
import { KEYS } from "../KEYS";

interface ClientIdHook {
    getClientId: () => string | null;
    generateClientId: () => string;
    checkIdExist: (key: KEYS) => boolean;
    saveLoggedUser:(value:boolean)=>void;
    getLoggedUser:()=>boolean;
    saveRole:(val:string)=>void
}

export const useClientIdState = (key: string): ClientIdHook => {
    // const [_,setLoggedUser] = useAtom(CheckUserLogged);
    const generateClientId = (): string => {
        return (crypto as any).randomUUID?.() ?? uuidv4();
    };

    const saveLoggedUser= (value:boolean)=>{
          sessionStorage.setItem(key,value+"");
          // setLoggedUser(value);
    }
    const saveRole = (value:string)=>{
        sessionStorage.setItem(key,value);
    }
    const getLoggedUser = ():boolean=>{
        const logged:string|null= sessionStorage.getItem(key);
        return logged==="true"
    }

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

    return { getClientId, generateClientId, checkIdExist,saveLoggedUser,getLoggedUser,saveRole };
};