import {useEffect, useState} from "react";
import {useWsClient} from "ws-request-hook";
import {ForceDisconnectedDto, StringConstants} from "../../api";
import {Disconnected} from "../../models";
import {useAtom} from "jotai/index";
import {ModalStateAtom} from "../../atoms";



export const useForceDisconnected = ()=>{
    const { onMessage, readyState } = useWsClient();
    const [_,setDisconnectedAtom] =  useAtom(ModalStateAtom);
    const [disconnected,setDisconnected] = useState<Disconnected>({
        disconnected:false,
        reason:""
    });
    useEffect(() => {
        if (!readyState) return;
        const unsubscribe = onMessage<ForceDisconnectedDto>(
            StringConstants.ForceDisconnectedDto,
            (message) => {
                const disc = {
                    disconnected:true,
                    reason:message.reason
                }
                setDisconnected(disc);
                setDisconnectedAtom(disc);
            }
        );
        return () => unsubscribe();
    }, [onMessage, readyState]);
    return disconnected;
}