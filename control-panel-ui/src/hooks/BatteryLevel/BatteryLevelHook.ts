import {useEffect, useState} from "react";
import {useWsClient} from "ws-request-hook";
import {BatteryLevelDto, StringConstants} from "../../api";

export const useBatteryLevel = ()=>{
    const { onMessage, readyState } = useWsClient();
    const [batteryLevel,setBatteryLevel] = useState<number>(0);
    useEffect(() => {
        if (!readyState) return;
        const unsubscribe = onMessage<BatteryLevelDto>(
            StringConstants.BatteryLevelDto,
            (message) => {
                const batteryLevel = message.batteryLevel;
                if (batteryLevel == null) return;
                 setBatteryLevel(batteryLevel);
            }
        );
        return () => unsubscribe();
    }, [onMessage, readyState]);
    return batteryLevel;
}