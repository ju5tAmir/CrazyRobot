import {useEffect, useState} from "react";
import {WARNING_LEVEL} from "../../models";
import {useWsClient} from "ws-request-hook";
import {NegativeDistanceNotifierDto, StringConstants} from "../../api";
import {useAtom} from "jotai";
import {EngineStateAtom} from "../../atoms";





export const useNegativeWarnings = ()=>{
    const { onMessage, readyState } = useWsClient();
    const [engineState,_] = useAtom(EngineStateAtom);
    const [negativeWarning, setWarning] = useState<boolean>(false);
    useEffect(() => {
    if (!readyState) return;
    const unsubscribe = onMessage<NegativeDistanceNotifierDto>(
        StringConstants.NegativeDistanceNotifierDto,
        (message) => {
            const warning = message.command.payload?.warning;
            if (!warning) return;
            if(warning===WARNING_LEVEL.SEVERE){
                setWarning(true);
            }
            if(warning===WARNING_LEVEL.FREE){
                setWarning(false);
            }
        }
    );
    return () => unsubscribe();
}, [onMessage, readyState]);
return engineState?negativeWarning:engineState;
}