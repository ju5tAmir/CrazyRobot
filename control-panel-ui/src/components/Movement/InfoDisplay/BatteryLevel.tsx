import {useBatteryLevel} from "../../../hooks/BatteryLevel/BatteryLevelHook.ts";
import {useEffect, useState} from "react";

export const BatteryLevel = () => {
    const batteryLevel = useBatteryLevel();
   const [levelColor,setLevelColor] = useState<string>();
    useEffect(() => {

        if(batteryLevel<20){
            setLevelColor('bg-red-500');
            return;
        }
        setLevelColor(batteryLevel > 50 ?'bg-green-500':'bg-blue-500');

    }, [batteryLevel]);



    return (
        <div className="w-full max-w-xs">
            <label className="label">
                <span className="label-text">Battery</span>
            </label>
            <progress
                className={`progress ${levelColor} w-full`}
                value={batteryLevel}
                max="100"
            ></progress>
            <div className="text-sm mt-1">
                {batteryLevel}%
            </div>
        </div>
    );
};
