import { Button } from "./Button.tsx";
import {useCallback, useEffect, useState} from "react";
import {useMqtt} from "../../hooks";
import MoveDetails from "../../mqtt/mqttComponents/MoveDetails.ts";
import {InfoDisplay} from "./index.ts";
import {FaPlay, FaStop} from "react-icons/fa";

export const ControlMotor = () => {
    const { messages, publishMovement,publishStartStopEvent } = useMqtt();
    const [engine, setEngine] = useState<boolean>(false);
    const [initSequence,setInitSequence] = useState<boolean>(false);

    const  [startStop,setStartStop] =  useState<Set<string>>(new Set());
    const [pressedKeys,setPressedKeys] = useState<Set<string>>(new Set());
    const movementKeys = new Set(['w', 'a', 's', 'd',"e"]);

    useEffect(() => {
        console.log("Engine Status:", initSequence);
        console.log(pressedKeys);
         if(startStop.has("e")||startStop.has("q")){
             publishStartStopEvent("start",initSequence);
         }
        publishMovement("drive",getStatus());
    }, [pressedKeys,initSequence]);

    useEffect(() => {
        console.log("I can receive now");
        console.log(messages);
        if(messages.length>0){
            if(messages[0].value==="true"){
                setEngine(true);
                pressedKeys.delete("e");
            }
        }

    }, [messages]);



    const handleInputDown = useCallback((value: string) => {
        console.log(value + " pressed");
        console.log(initSequence + "init status");
        if (!initSequence && value !== "e") return;

        setPressedKeys(prev => {
            const newSet = new Set(prev);
            if (value === 'e') {
                if (newSet.has('e')) {
                    console.log("deleted");
                    newSet.delete('e');
                } else {
                    console.log("added");
                    newSet.add('e');
                }
                setInitSequence(prev => !prev);
                return newSet;
            }

            console.log("added " + value);
            newSet.add(value);
            return newSet;
        });
    }, [initSequence]);

    const handleInputUp = useCallback((value: string) => {
        console.log(value + " released");
        if (value === "e") return;
        if (!engine) return;

        setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(value);
            return newSet;
        });
    }, [engine]);


    // const handleKeyDown = (e: KeyboardEvent) => {
    //     const current = e.key.toLowerCase();
    //
    //     if(!movementKeys.has(current)){
    //         return;
    //     }
    //     handleInputDown(current);
    // };
    //
    // const handleKeyUp = (e: KeyboardEvent) => {
    //     const current = e.key.toLowerCase();
    //
    //     if(!movementKeys.has(current)){
    //         return;
    //     }
    //     handleInputUp(current);
    // };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const current = e.key.toLowerCase();
        if (!movementKeys.has(current)) return;
        handleInputDown(current);
    }, [handleInputDown]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const current = e.key.toLowerCase();
        if (!movementKeys.has(current)) return;
        handleInputUp(current);
    }, [handleInputUp]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);
    const getStatus = (): MoveDetails => ({
        engine:initSequence,
        move: {
            isMoving:  false,
            value: "None"
        },
        direction: {
            isTurning:  false,
            value:  "None"
        },
        speed:3
    });

    return (
        <>
            <div className={"grid grid-cols-2 gap-2 justify-center"}>
            <InfoDisplay engineState={engine} batteryStatus={0} initializeStatus={initSequence}></InfoDisplay>

                <div>
                    <div className={"flex flex-row justify-center items-center mb-2 gap-2"}>
                        <button  disabled={true} className={"btn btn-neutral w-1/6 invisible"}>
                        </button>
                        <Button value={"w"} color={""}
                                handlePressed={() => handleInputDown("w")}
                                handleReleased={() => handleInputUp("w")}
                                handleEngineState={engine}
                                isPressed={pressedKeys.has("w")}/>
                        <button className={"btn btn-neutral w-1/6"}
                                onClick={() => handleInputDown('e')} >
                            {initSequence ? <FaStop/> : <FaPlay/>}
                        </button>
                    </div>

                    <div className={"flex flex-row justify-center gap-2 items-center"}>
                        <Button value={"a"}
                                handlePressed={() => handleInputDown("a")}
                                handleReleased={() => handleInputUp("a")}
                                color={""}
                                handleEngineState={engine}
                                isPressed={pressedKeys.has("a")}
                                  />
                        <Button value={"s"}
                                handlePressed={() => handleInputDown("s")}
                                handleReleased={() => handleInputUp("s")}
                                color={""}
                                handleEngineState={engine}
                                isPressed={pressedKeys.has("s")}
                               />
                        <Button value={"d"}
                                handlePressed={() => handleInputDown("d")}
                                handleReleased={() => handleInputUp("d")}
                                color={""}
                                handleEngineState={engine}
                                isPressed={pressedKeys.has("d")}
                               />
                    </div>
                </div>
            </div>
        </>
    );
}
