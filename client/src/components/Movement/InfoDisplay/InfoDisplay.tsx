import {InfoDisplayProps} from "../../../models";
import {Loading} from "../index.ts";
import {BatteryLevel} from "./BatteryLevel.tsx";


export const InfoDisplay =(props:InfoDisplayProps)=> {
    return( <div className={"flex flex-col justify-start items-start"}>
        <h1>Info Panel</h1>
        <div className={"flex flex-row justify-center items-center p-2"}>
            {props.initializeStatus ? (<Loading/>) : <p>Engine : {`${props.engineState ? "ON" : "OFF"}`} </p>}
        </div>
        <p><BatteryLevel/></p>
    </div>)
}
