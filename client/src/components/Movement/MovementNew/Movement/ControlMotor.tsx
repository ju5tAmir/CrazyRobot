import {Button} from "./Button.tsx";
import { Leva } from 'leva';
import {useCallback, useEffect, useRef, useState} from "react";
import { subscribeClientToRobot, unsubscribeClientFromRobot} from "./index.ts";
import {FaPlay, FaStop} from "react-icons/fa";
import {useWsClient} from "ws-request-hook";
import {InfoDisplay} from "../../index.ts";
import {
    EngineStateDto,
    InitializeEnginResponseDto,
    RobotMovementDto,
    ServerConfirmsDto,
    ServerSendsErrorMessageDto,
    StringConstants
} from "../../../../api";
import toast from "react-hot-toast";
import {CommandType, DIRECTION_WARNING, MovementCommand} from "../../../../models/mqttModels/MqttModels.ts";
import {DangerDisplay} from "../../InfoDisplay";
import {DangerDisplayOrientation} from "../../../../models";
import {useAtom} from "jotai";
import {EngineStateAtom} from "../../../../atoms";
import {useClientIdState} from "../../../../hooks/Wsclient";
import {KEYS} from "../../../../hooks/KEYS";
import {useNavigate} from "react-router-dom";
import ThreeDView from "../../../ThreeD/ThreeDView.tsx";
import {useForceDisconnected} from "../../../../hooks";



export const ControlMotor = () => {
    const {onMessage, sendRequest, readyState} = useWsClient();
    const [,setEngineAtom] = useAtom(EngineStateAtom);
    const previousPressed = useRef<Set<string>>(new Set());
    const [engine, setEngine] = useState<boolean>(false);
    const [startProcedure,setStartProcedure] = useState(false);
    // prevent user to stop the start procedure prematurely
    const [engineLocked,setEngineLocked] = useState(false);
    //holds the pressed keys, to prevent sending continuous commands to esp32
    const [pressedKeys,setPressedKeys] = useState<Set<string>>(new Set());
    //last movement command that has been pressed
    const [lastPressed,setLastPressed] = useState<string>("");
    const movementKeys = new Set(['w', 'a', 's', 'd',"e"]);
    const manageClientId = useClientIdState(KEYS.CLIENT_ID);
    const navigate = useNavigate();
    const clientId = manageClientId.getClientId() || '';
    const subscribedRef = useRef(false);
    const disconnected = useForceDisconnected();




    useEffect(() => {

        if (readyState!==1 || clientId === "") return;
        if(disconnected.disconnected)return ;
        let isMounted = true;
        const handleSubscription = async () => {
            const success = await subscribeClientToRobot(clientId, sendRequest);
            if (success && isMounted) {
                subscribedRef.current=true;
            } else if (isMounted) {
                toast.error("Could not connect to robot");
                navigate("/school-info");
            }
        };

        handleSubscription();

        return () => {
            isMounted = false;
            if (subscribedRef.current) {
                unsubscribeClientFromRobot(clientId, sendRequest)
                    .then(success => {
                        if (!success) {
                            console.warn("Failed to unsubscribe");
                        }
                    })
                    .catch(err => {
                        console.error("Unsubscribe error", err);
                    });
            }
        };
    }, [readyState]);

    useEffect(() => {
        if (!readyState) return;
        const unsubscribe = onMessage<InitializeEnginResponseDto>(
            StringConstants.InitializeEnginResponseDto,
            (message) => {
                const payload = message.command.payload;
                const error = payload?.errorMessage ?? "";
                const status = payload?.initializeEngine;
                setStartProcedure(false);
                setEngineLocked(false);
                if (error.length > 0) {
                    toast.error (`${error}`)
                }
                const engineOn = !status;
                setEngine(engineOn);
                setEngineAtom(engineOn);
                toast.success(`Engine: ${engineOn ? "ON" : "OFF"}`);
            }
        );

        return () => unsubscribe();
    }, [onMessage, readyState]);


    useEffect(() => {
        if (!readyState || pressedKeys.size === 0 ) return;
        const keysChanged = [...pressedKeys].some(k => !previousPressed.current.has(k)) ||
            [...previousPressed.current].some(k => !pressedKeys.has(k));
        if (keysChanged) {
            sendMovementCommand();
        }
        previousPressed.current = new Set(pressedKeys);
    }, [pressedKeys,readyState]);

    const handleInputDown = useCallback((value: string) => {
        if (value === "e") {
            //while the start procedure is executing we prevent users to press start stop motor button
            if (engineLocked || startProcedure) {
                console.log("Engine is locked or initializing... blocking 'e' press.");
                return;
            }
            // start the engine if is of
            if (!engine) {
                setStartProcedure(true);
                sendEngineCommand(true);
            } else {
                //stop the engine if is on
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
            newSet.add(value);
            setLastPressed(value);
            return newSet;
        });

    }, [startProcedure]);



    const handleInputUp = useCallback((value: string) => {
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
                , ServerConfirmsDto>(request,StringConstants.ServerConfirmsDto)
            if (signInResult?.success) {
                toast.success("Engine command processing")
            } else {
                toast.error("Retry")
            }
        }catch (error){
             const errorDto = error as unknown as ServerSendsErrorMessageDto;
             toast.error("Engine initializing failed");
             toast.error(errorDto.message!);
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
        try{
            const sentCommandResult: ServerConfirmsDto = await sendRequest<RobotMovementDto,
                ServerConfirmsDto>(request,StringConstants.ServerConfirmsDto).finally(()=>console.log("er"));
            if (sentCommandResult?.success) {
                toast.success("Sent successfully.")
            } else {
                toast.error("Error")
            }
        }catch (error){
            const errorDto = error as unknown as ServerSendsErrorMessageDto;
            console.error(errorDto.error!.toString);
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


    if(disconnected.disconnected){
        navigate("/school-info");
        return ;
    }

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

                <div className="grid grid-cols-[1fr_2fr_2fr_2fr_1fr] grid-rows-4  place-items-center  w-screen">
                    <div className="col-span-1  col-start-3 row-start-1 row-end-2 ">
                        <DangerDisplay position={DIRECTION_WARNING.FRONT}
                                       orientation={DangerDisplayOrientation.HORIZONTAL}></DangerDisplay>
                    </div>
                    <div className="col-span-3 col-start-2 row-start-2 row-span-1  w-full ">
                        <div className={"flex flex-row justify-center items-center mb-2 gap-2 flex-grow"}>
                            <button disabled={true} className={"btn btn-neutral w-1/6 invisible"}>
                            </button>
                            <Button value={"w"} color={""}
                                    handlePressed={() => handleInputDown ("w")}
                                    handleReleased={() => handleInputUp ("w")}
                                    handleEngineState={engine}
                                    isPressed={pressedKeys.has ("w")}/>
                            <button className={`btn btn-neutral w-1/6 ${engineStartedColor ()}`}
                                    onClick={() => handleInputDown ('e')}>
                                {engine ? <FaStop/> : <FaPlay/>}
                            </button>
                        </div>
                    </div>


                    <div className="col-span-3 col-start-2 row-start-3 row-span-1  w-full ">
                        <div className={"flex flex-row justify-center gap-2 items-center "}>
                            <DangerDisplay position={DIRECTION_WARNING.LEFT}
                                           orientation={DangerDisplayOrientation.VERTICAL}></DangerDisplay>
                            <Button value={"a"}
                                    handlePressed={() => handleInputDown ("a")}
                                    handleReleased={() => handleInputUp ("a")}
                                    color={""}
                                    handleEngineState={engine}
                                    isPressed={pressedKeys.has ("a")}
                            />
                            <Button value={"s"}
                                    handlePressed={() => handleInputDown ("s")}
                                    handleReleased={() => handleInputUp ("s")}
                                    color={""}
                                    handleEngineState={engine}
                                    isPressed={pressedKeys.has ("s")}
                            />
                            <Button value={"d"}
                                    handlePressed={() => handleInputDown ("d")}
                                    handleReleased={() => handleInputUp ("d")}
                                    color={""}
                                    handleEngineState={engine}
                                    isPressed={pressedKeys.has ("d")}
                            />
                            <DangerDisplay position={DIRECTION_WARNING.RIGHT}
                                           orientation={DangerDisplayOrientation.VERTICAL}></DangerDisplay>
                        </div>
                    </div>


                    <div className="col-span-1 col-start-3 row-start-4 row-span-1  justify-self-start w-full ">
                        <DangerDisplay position={DIRECTION_WARNING.BACK}
                                       orientation={DangerDisplayOrientation.HORIZONTAL}></DangerDisplay>
                    </div>
                </div>
                <Leva collapsed />
                <ThreeDView/>
            </div>
        </>
    );
}
