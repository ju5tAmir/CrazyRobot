import {DangerDisplayOrientation, DangerDisplayProps, DIRECTION_WARNING, WARNING_LEVEL} from "../../../../models";
import {DotColumn} from "./DotColumn.tsx";
import {DotRow} from "./DotRow.tsx";
import {useDistanceWarnings, useNegativeWarnings} from "../../../../hooks";
import {useAtom} from "jotai";
import {EngineStateAtom} from "../../../../atoms";

/**
 * `DangerDisplay` is a visual indicator component that represents the level of danger or warning
 * in a specific direction based on engine and sensor state. It displays a series of colored dots
 * (either in rows or columns) depending on the orientation.
 *
 * The component uses internal state from global atoms and computes the display color dynamically
 * based on the severity of warnings (e.g., mild, severe, or negative system state).
 *
 * @param {DangerDisplayProps} props - The properties object, that will hold information about position and orientation.
 * @param {DangerDisplayOrientation} props.orientation - Determines the layout (VERTICAL or HORIZONTAL).
 * @param {DIRECTION_WARNING} props.position - The direction for which to show the warning level.
 *
 * @returns  A set of dot rows or columns colored based on warning severity.
 */
export const DangerDisplay = (props:DangerDisplayProps)=>{
 const  isVertical = props.orientation===DangerDisplayOrientation.VERTICAL;
 const [engineState,_]=useAtom(EngineStateAtom);
 const warnings= useDistanceWarnings();
 const negativeWarning = useNegativeWarnings();


    const computeColor = (position: DIRECTION_WARNING) => {
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