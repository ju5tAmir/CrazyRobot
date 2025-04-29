import {Button} from "./Button.tsx";
import {useCallback, useEffect, useState} from "react";
import {InfoDisplay} from "./index.ts";
import {FaPlay, FaStop} from "react-icons/fa";
import MoveDetails from "../../../../mqtt/mqttComponents/MoveDetails.ts";
import {useWsClient} from "ws-request-hook";
import {
    EngineStateDto, InitializeEnginResponseDto,
    ServerConfirmsDto,
    ServerSendsErrorMessageDto,
    StringConstants
} from "../../../../api/webSocketApi.ts";
import toast from "react-hot-toast";
import {CommandType} from "../../../../models/mqttModels/MqttModels.ts";


export const ControlMotor = () => {
    // const { messages, publ`ishMovement,publishStartStopEvent } = useMqtt();

    const {onMessage, sendRequest, send, readyState} = useWsClient();
    const [engine, setEngine] = useState<boolean>(false);
    const [initSequence,setInitSequence] = useState<boolean>(false);
    const [pressedKeys,setPressedKeys] = useState<Set<string>>(new Set());
    const movementKeys = new Set(['w', 'a', 's', 'd',"e"]);

    // useEffect(() => {
    //     console.log("Engine Status:", initSequence);
    //     console.log(pressedKeys);
    //      if(startStop.has("e")||startStop.has("q")){
    //          publishStartStopEvent("start",initSequence);
    //      }
    //     publishMovement("drive",getStatus());
    // }, [pressedKeys,initSequence]);
    //
    // useEffect(() => {
    //     console.log("I can receive now");
    //     console.log(messages);
    //     if(messages.length>0){
    //         if(messages[0].value==="true"){
    //             setEngine(true);
    //             pressedKeys.delete("e");
    //         }
    //     }
    //
    // }, [messages]);
    useEffect(() => {
        if(!readyState)return
        console.log("✅ WebSocket is ready! Subscribing to messages...");

        const unsubscribe = onMessage<InitializeEnginResponseDto>(
            StringConstants.InitializeEnginResponseDto,
            (message) => {
                console.log("----------------=================");
                console.log(message.command.payload);
                const payloade = message.command.payload;

                console.log(payloade?.initializeEngine);

                toast.success(`New Question ID: ${message.command}`);
                // setCurrentQuestion({
                //     gameId: message.gameId || "",
                //     questionId: message.questionId || "",
                //     options: message.questionOptions || []
                // });
                setInitSequence(message.command.payload!.initializeEngine);
                toast.success(`New Question ID: ${message.command.payload+""}`);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [onMessage, readyState]);


    const handleInputDown = useCallback((value: string) => {
        console.log(value + " pressed");

        if (value === "e") {
            const newEngineState = !engine;
            setEngine(newEngineState);
            sendEngineCommand(newEngineState);
            setInitSequence(prev => !prev);
            setPressedKeys(prev => {
                const newSet = new Set(prev);
                if (newSet.has('e')) {
                    console.log("deleted");
                    newSet.delete('e');
                } else {
                    console.log("added");
                    newSet.add('e');
                }
                return newSet;
            });


            return;
        }

        if (!initSequence) return;
        setPressedKeys(prev => {
            const newSet = new Set(prev);
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


    /**
     * Adds two numbers together.
     * @param a The first number.
     * @param b The second number.
     * @returns The sum of `a` and `b`.
     */
    const sendEngineCommand = async (value:boolean)=>{
         const request:EngineStateDto = {
             eventType:StringConstants.EngineStateDto,
             requestId:crypto.randomUUID(),
             command:{
                 command:CommandType.Initialize,
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
