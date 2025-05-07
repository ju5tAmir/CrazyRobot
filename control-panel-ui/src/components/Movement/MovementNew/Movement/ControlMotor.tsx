import {Button} from "./Button.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {InfoDisplay} from "./index.ts";
import {FaPlay, FaStop} from "react-icons/fa";
import {useWsClient} from "ws-request-hook";
import {
    EngineStateDto,
    InitializeEnginResponseDto,
    RobotMovementDto,
    ServerConfirmsDto,
    ServerSendsErrorMessageDto,
    StringConstants
} from "../../../../api/webSocketApi.ts";
import toast from "react-hot-toast";
import {CommandType, MovementCommand} from "../../../../models/mqttModels/MqttModels.ts";
import {DangerDisplay} from "../../InfoDisplay/DangerDisplay/DangerDisplay.tsx";
import {DangerDisplayOrientation} from "../../../../models";
import {POSITION} from "../../../../models/dangerDisplay/DangerDisplayProps.ts";

//Todo implement to skip short bursts to avoid esp32 overload

// const currentCommand = JSON.stringify(directions); // serialize for comparison
//
// if (lastSentCommandRef.current === currentCommand) {
//     console.log("🚫 Duplicate command skipped");
//     return;
// }
//
// lastSentCommandRef.current = currentCommand;
export const ControlMotor = () => {
    const {onMessage, sendRequest, send, readyState} = useWsClient();
    const previousPressed = useRef<Set<string>>(new Set());
    const [engine, setEngine] = useState<boolean>(false);
    const [startProcedure,setStartProcedure] = useState(false);
    // prevent user to stop the start procedure prematurely
    const [engineLocked,setEngineLocked] = useState(false);
    //holds the pressed keys, to prevent sending continuos commands to esp32
    const [pressedKeys,setPressedKeys] = useState<Set<string>>(new Set());
    //last movement command that has been pressed
    const [lastPressed,setLastPressed] = useState<string>("");
    const movementKeys = new Set(['w', 'a', 's', 'd',"e"]);

    useEffect(() => {
        if (!readyState) return;

        console.log("✅ WebSocket is ready! Subscribing to messages...");

        const unsubscribe = onMessage<InitializeEnginResponseDto>(
            StringConstants.InitializeEnginResponseDto,
            (message) => {
                const payload = message.command.payload;
                const error = payload?.ErrorMessage ?? "";
                const status = payload?.initializeEngine;

                console.log("Message Payload:", payload);
                console.log("Pressed E:", pressedKeys.has("e"));
                console.log("Engine Status Flag:", status);

                setStartProcedure(false);
                setEngineLocked(false);

                if (error.length > 0) {
                    toast.error(`Engine error: ${error}`);
                    setEngine(false);
                    return;
                }

                const engineOn = !status;
                setEngine(engineOn);

                toast.success(`Engine: ${engineOn ? "ON" : "OFF"}`);
            }
        );

        return () => unsubscribe();
    }, [onMessage, readyState]);


    useEffect(() => {

        console.log("New press");
        const keysChanged = [...pressedKeys].some(k => !previousPressed.current.has(k)) ||
            [...previousPressed.current].some(k => !pressedKeys.has(k));
        if (keysChanged) {
            sendMovementCommand();
        }
        previousPressed.current = new Set(pressedKeys);
    }, [pressedKeys]);




    const handleInputDown = useCallback((value: string) => {
        console.log(value + " pressed");
        if (value === "e") {
            if (engineLocked || startProcedure) {
                console.log("Engine is locked or initializing... blocking 'e' press.");
                return;
            }
            console.log(engine + " engineState")
            if (!engine) {
                console.log("Starting engine...");
                setStartProcedure(true);
                sendEngineCommand(true);
            } else {
                console.log("Stopping engine...");
                setStartProcedure(true);
                sendEngineCommand(false);
            }
            setPressedKeys(prev => {
                const newSet = new Set(prev);
                if (newSet.has('e')) {
                    newSet.delete('e');
                } else {
                    newSet.add('e');
                }
                return newSet;
            });

            return;
        }
        if (!engine) return;
        setPressedKeys(prev => {
            const newSet = new Set(prev);
            console.log("added " + value);
            newSet.add(value);
            setLastPressed(value);
            return newSet;
        });

    }, [startProcedure]);



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





    /**
     * send start stop commands
     * @returns false meaning that initialization is completed and true meaning that initialization can start again
     * @param value
     */
    const sendEngineCommand = async (value:boolean)=>{
          console.log("value"+ value +"");
            setEngineLocked(true);
        const request:EngineStateDto = {
             eventType:StringConstants.EngineStateDto,
             requestId:crypto.randomUUID(),
             command:{
                 commandType:CommandType.Initialize,
                 payload:{
                     engine:value
                 }
             }
         }
         try{
            const signInResult: ServerConfirmsDto = await sendRequest<EngineStateDto
                , ServerConfirmsDto>(request,StringConstants.ServerConfirmsDto).finally(()=>console.log("er"));
            console.log(signInResult);
            if (signInResult?.Success) {
                toast.success("Engine send")
            } else {
                toast.error("Retry")
            }
        }catch (error){
            const errorDto = error as unknown as ServerSendsErrorMessageDto;
            toast.error(errorDto.error!.toString);
        }
    }

    const sendMovementCommand=async ()=>{
        const directions:MovementCommand = {activeMovements:Array.from(pressedKeys).filter((i)=>i!=="e"),lastCommand:lastPressed};
        const request:RobotMovementDto = {
            eventType:StringConstants.RobotMovementDto,
            requestId:crypto.randomUUID(),
            command:{
            commandType:CommandType.Move,
            payload:{
                directions
            }}
        }
        console.log(request);
        try{
            const sentCommandResult: ServerConfirmsDto = await sendRequest<RobotMovementDto,
                ServerConfirmsDto>(request,StringConstants.ServerConfirmsDto).finally(()=>console.log("er"));

            if (sentCommandResult?.Success) {
                toast.success("Engine send")
            } else {
                toast.error("Retry")
            }
        }catch (error){
            const errorDto = error as unknown as ServerSendsErrorMessageDto;
            toast.error(errorDto.error!.toString);
        }
    }

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

    const engineStartedColor = ()=>{
        if(engineLocked){
            return "bg-orange-600";
        }else if(engine){
            return "bg-green-600";
        }else{
            return "bg-red-600"
        }
    }

    return (
        <>
            <div className={"flex flex-col gap-2 justify-center"}>
                <InfoDisplay engineState={engine} batteryStatus={0} initializeStatus={engineLocked}></InfoDisplay>

                <div className="grid grid-cols-[1fr_2fr_2fr_2fr_1fr] grid-rows-4  place-items-center border-2 border-green-600 w-screen">
                    <div className="col-span-1  col-start-3 row-start-1 row-end-2 border border-gray-700">
                        <DangerDisplay position={POSITION.FRONT} orientation={DangerDisplayOrientation.HORIZONTAL}></DangerDisplay>
                    </div>
                    <div className="col-span-3 col-start-2 row-start-2 row-span-1 border border-gray-700 w-full ">
                        <div className={"flex flex-row justify-center items-center mb-2 gap-2 flex-grow"}>
                            <button disabled={true} className={"btn btn-neutral w-1/6 invisible"}>
                            </button>
                            <Button value={"w"} color={""}
                                    handlePressed={() => handleInputDown("w")}
                                    handleReleased={() => handleInputUp("w")}
                                    handleEngineState={engine}
                                    isPressed={pressedKeys.has("w")}/>
                            <button className={`btn btn-neutral w-1/6 ${engineStartedColor()}`}
                                    onClick={() => handleInputDown('e')}>
                                {engine ? <FaStop/> : <FaPlay/>}
                            </button>
                        </div>
                    </div>


                    <div className="col-span-1 col-start-1 row-start-3 row-span-1 border border-gray-700 ">

                    </div>

                    <div className="col-span-3 col-start-2 row-start-3 row-span-1 border border-gray-700 w-full ">
                        <div className={"flex flex-row justify-center gap-2 items-center "}>
                            <DangerDisplay position={POSITION.LEFT} orientation={DangerDisplayOrientation.VERTICAL}></DangerDisplay>
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
                            <DangerDisplay position={POSITION.RIGHT} orientation={DangerDisplayOrientation.VERTICAL}></DangerDisplay>
                        </div>
                    </div>

                    <div className="col-span-1 col-start-5 row-start-3 row-span-1 border border-gray-700 self-start ">

                    </div>

                    <div className="col-span-1 col-start-3 row-start-4 row-span-1 border border-gray-700 justify-self-start w-full ">
                        <DangerDisplay position={POSITION.BACK}  orientation={DangerDisplayOrientation.HORIZONTAL}></DangerDisplay>
                    </div>
                </div>

                {/*<div>*/}
                {/*    <DangerDisplay orientation={DangerDisplayOrientation.VERTICAL}></DangerDisplay>*/}
                {/*    <div className={"flex flex-row justify-center items-center mb-2 gap-2"}>*/}
                {/*    <button disabled={true} className={"btn btn-neutral w-1/6 invisible"}>*/}
                {/*        </button>*/}
                {/*        <Button value={"w"} color={""}*/}
                {/*                handlePressed={() => handleInputDown("w")}*/}
                {/*                handleReleased={() => handleInputUp("w")}*/}
                {/*                handleEngineState={engine}*/}
                {/*                isPressed={pressedKeys.has("w")}/>*/}
                {/*        <button className={`btn btn-neutral w-1/6 ${engineStartedColor()}`}*/}
                {/*                onClick={() => handleInputDown('e')}>*/}
                {/*            {engine ? <FaStop/> : <FaPlay/>}*/}
                {/*        </button>*/}
                {/*    </div>*/}

                {/*    <div className={"flex flex-row justify-center gap-2 items-center"}>*/}
                {/*        <Button value={"a"}*/}
                {/*                handlePressed={() => handleInputDown("a")}*/}
                {/*                handleReleased={() => handleInputUp("a")}*/}
                {/*                color={""}*/}
                {/*                handleEngineState={engine}*/}
                {/*                isPressed={pressedKeys.has("a")}*/}
                {/*        />*/}
                {/*        <Button value={"s"}*/}
                {/*                handlePressed={() => handleInputDown("s")}*/}
                {/*                handleReleased={() => handleInputUp("s")}*/}
                {/*                color={""}*/}
                {/*                handleEngineState={engine}*/}
                {/*                isPressed={pressedKeys.has("s")}*/}
                {/*        />*/}
                {/*        <Button value={"d"}*/}
                {/*                handlePressed={() => handleInputDown("d")}*/}
                {/*                handleReleased={() => handleInputUp("d")}*/}
                {/*                color={""}*/}
                {/*                handleEngineState={engine}*/}
                {/*                isPressed={pressedKeys.has("d")}*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*    <DangerDisplay orientation={DangerDisplayOrientation.VERTICAL}></DangerDisplay>*/}
                {/*</div>*/}

            </div>
        </>
    );
}
