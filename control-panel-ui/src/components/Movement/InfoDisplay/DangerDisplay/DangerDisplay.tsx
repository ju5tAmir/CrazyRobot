import {DangerDisplayOrientation, DangerDisplayProps} from "../../../../models";
import {DotColumn} from "./DotColumn.tsx";
import {DotRow} from "./DotRow.tsx";
import {useEffect, useRef, useState} from "react";
import {NegativeDistanceNotifierDto, StringConstants} from "../../../../api/webSocketApi.ts";
import toast from "react-hot-toast";
import {useWsClient} from "ws-request-hook";
import {POSITION} from "../../../../models/dangerDisplay/DangerDisplayProps.ts";


export const DangerDisplay = (props:DangerDisplayProps)=>{
 const  isVertical = props.orientation===DangerDisplayOrientation.VERTICAL;
 const [signalColor,setColor] = useState<string>("");
 const positionState = useRef<boolean>(false);
 const {onMessage, readyState} = useWsClient();
    useEffect(() => {
        if (!readyState) return;

        console.log("✅ WebSocket is ready! Subscribing to messages...");

        const unsubscribe = onMessage<NegativeDistanceNotifierDto>(
            StringConstants.NegativeDistanceNotifierDto,
            (message) => {
                console.log(message.command.command + "arrived");
                const payload = message.command.payload?.warning;
                if(payload==="severe"){
                   setColor("bg-red-500 ");
                   positionState.current=true;
                }
                toast.success(payload +"");
            }
        );

        return () => unsubscribe();
    }, [onMessage, readyState]);


   // if(positionState.current && (props.position!==POSITION.FRONT)){
   //     return ;
   // }
  const computeColor = (position:POSITION)=>{
     return  position==POSITION.FRONT?signalColor:""
  }


    return (
        <div
            className={`grid ${props.orientation === DangerDisplayOrientation.VERTICAL ? "grid-cols-2" : "grid-cols-1 grid-rows-2"} gap-2`}>
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