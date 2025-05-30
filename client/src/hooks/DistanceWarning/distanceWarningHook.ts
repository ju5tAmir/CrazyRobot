import { useEffect, useState } from "react";
import {DIRECTION_WARNING, WARNING_LEVEL} from "../../models";
import {useWsClient} from "ws-request-hook";
import {DangerMovementDto, StringConstants} from "../../api";
import {Terminator} from "../../models";




export type DistanceWarning ={
    [key in DIRECTION_WARNING]: WARNING_LEVEL;
}
// warning string will come from the esp32 in this format Front,Back,Left,Right
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
        const unsubscribe = onMessage<DangerMovementDto>(
            StringConstants.DangerMovementDto,
            (message) => {
                const warning = message.command.payload?.warning;
                if (!warning) return;

                setWarnings((prev) => {
                    // Remove everything after and including the TERMINATOR
                    const terminatorIndex = warning.indexOf(Terminator);
                    const cleanWarning = terminatorIndex !== -1
                        ? warning.substring(0, terminatorIndex-1)
                        : warning;

                    const levels = cleanWarning.split(",").map(lvl => lvl.trim());
console.log(levels);
                    if (levels.length !== 4) {
                        return prev;
                    }

                    return {
                        [DIRECTION_WARNING.FRONT]: levels[0] as WARNING_LEVEL,
                        [DIRECTION_WARNING.BACK]: levels[1] as WARNING_LEVEL,
                        [DIRECTION_WARNING.LEFT]: levels[2] as WARNING_LEVEL,
                        [DIRECTION_WARNING.RIGHT]: levels[3] as WARNING_LEVEL,
                    };
                });

            }
        );

        return () => unsubscribe();
    }, [onMessage, readyState]);

    return warnings;
}
