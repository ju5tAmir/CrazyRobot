import { useEffect, useState } from "react";
import {DIRECTION_WARNING, WARNING_LEVEL} from "../../models";
import {useWsClient} from "ws-request-hook";
import {DangerMovementDto, StringConstants} from "../../api";



export type DistanceWarning ={
    [key in DIRECTION_WARNING]: WARNING_LEVEL;
}

export function useDistanceWarnings() {
    const [warnings, setWarnings] = useState<DistanceWarning>({
        [DIRECTION_WARNING.FRONT]: WARNING_LEVEL.FREE,
        [DIRECTION_WARNING.BACK]: WARNING_LEVEL.FREE,
        [DIRECTION_WARNING.LEFT]: WARNING_LEVEL.FREE,
        [DIRECTION_WARNING.RIGHT]: WARNING_LEVEL.FREE
    });

    const { onMessage, readyState } = useWsClient();

    useEffect(() => {
        if (!readyState) return;

        console.log("✅ Subscribing to DangerMovementDto WebSocket messages...");

        const unsubscribe = onMessage<DangerMovementDto>(
            StringConstants.DangerMovementDto,
            (message) => {
                const warning = message.command.payload?.warning;
                const direction = message.command.payload?.direction as DIRECTION_WARNING;

                if (!warning || !direction) return;

                setWarnings((prev) => {
                    if (prev[direction] === warning) return prev;
                    return { ...prev, [direction]: warning };
                });
            }
        );

        return () => unsubscribe();
    }, [onMessage, readyState]);

    return warnings;
}
