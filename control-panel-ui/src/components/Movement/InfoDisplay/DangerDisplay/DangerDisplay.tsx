import {DangerDisplayOrientation, DangerDisplayProps, DIRECTION_WARNING, WARNING_LEVEL} from "../../../../models";
import {DotColumn} from "./DotColumn.tsx";
import {DotRow} from "./DotRow.tsx";
import {useDistanceWarnings, useNegativeWarnings} from "../../../../hooks";
import {useAtom} from "jotai";
import {EngineStateAtom} from "../../../../atoms";


export const DangerDisplay = (props:DangerDisplayProps)=>{
 const  isVertical = props.orientation===DangerDisplayOrientation.VERTICAL;
 const [engineState,_]=useAtom(EngineStateAtom);
 const warnings= useDistanceWarnings();
 const negativeWarning = useNegativeWarnings();
    const computeColor = (position: DIRECTION_WARNING) => {
console.log("engineState" + engineState);
        if(!engineState){
            return "";
        }
        if(negativeWarning){
            return "bg-yellow-300";
        }
        const level = warnings[position];
        const color = level === WARNING_LEVEL.SEVERE
            ? "bg-red-600"
            : level === WARNING_LEVEL.MILD
                ? "bg-orange-400"
                : "";

        console.log(`Position: ${position}, Level: ${level}, Class: ${color}`);
        return color;
    };



    return (
        <div
            className={`grid ${props.orientation === DangerDisplayOrientation.VERTICAL ?  "grid-cols-2" : "grid-cols-1 grid-rows-2"} gap-2`}>
            {isVertical ? (
                <>
                    <DotColumn size={2} color={computeColor(props.position)}/>
                    <DotColumn size={2} color={computeColor(props.position)}/>
                </>
            ) : (
                <>
                    <DotRow size={6} color={computeColor(props.position)}/>
                    <DotRow size={6} color={computeColor(props.position)}/>
                </>
            )}
        </div>

    )
}