import {useEffect, useState} from "react";
import { ServerSendsTimerDto, StringConstants} from "../../api";
import {useWsClient} from "ws-request-hook";
import {useClientIdState} from "../Wsclient";
import {KEYS} from "../KEYS";

export const useTimerHook=()=>{
    const { onMessage, readyState } = useWsClient();
    const manageClientId = useClientIdState(KEYS.CLIENT_ID);
    const [showModal,setShowModal]= useState<boolean>(false);
    useEffect(() => {
        if (!readyState) return;
        console.log("✅ Subscribing to Timer WebSocket messages...");
        const unsubscribe = onMessage<ServerSendsTimerDto>(
            StringConstants.ServerSendsTimerDto,
            (message) => {
                const status = message.status;
                const clientId = message.clientId;
                console.log("Received clientId:", clientId);
                console.log("Local clientId:", manageClientId.getClientId());
                if(clientId===manageClientId.getClientId())
                { setShowModal(status);}
            }
        );
        return () => unsubscribe();
    }, [onMessage, readyState]);
    return {
        showModal,
        setShowModal,
    };
}