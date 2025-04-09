





// Notes: There is an issue with increasing speed when speed is already set to decrease.
//        When shift is pressed, w or s doesn't work.
//
import {useState, useEffect, useRef} from 'react';
import MoveDetails from '../../mqtt/mqttComponents/MoveDetails.ts';
import {Button} from "./Button.tsx";
import {useMqtt} from "../../hooks";





export default function Motor() {
    const {messages,publish} = useMqtt();
    const topic = import.meta.env.VITE_MQTT_TOPIC;
    const SPEED_INCREASE_RATE = 5;
    const SPEED_DECREASE_RATE = 10;
    const SPEED_INTERVAL_MS = 150;
    const BASE_SPEED = 150; // It's different in each motor
    const MAX_SPEED = 255;
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const allowedKeys = new Set(['w', 'a', 's', 'd', 'e', 'shift', 'space']);
    const [engine, setEngine] = useState<boolean>(false);
    const [move, setMove] = useState<string | boolean>(false);
    const [direction, setDirection] = useState<string | boolean>(false);
    const [speed, setSpeed] = useState<number>(BASE_SPEED);
    const speedInterval = useRef<NodeJS.Timeout | null>(null); // Store interval reference

    useEffect(() => {
        setEventListeners();
        // Cleanup the event listeners when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    },[]);

    useEffect(() => {
        messages.forEach((m)=>console.log(m));
    }, [messages]);

    useEffect(() => {
        // When engine state changes, publish the new state
        publish(topic, {
            engine: engine,
            move: {
                isMoving: move !== false,
                value: move ? String(move) : "None"
            },
            direction: {
                isTurning: direction !== false,
                value: direction ? String(direction) : "None"
            },
            speed: speed
        });

        console.log(`Engine ${engine ? 'Started' : 'Stopped'}.`);
    }, [engine]);





    const handleInputDown = (key: string) => {
        if (!allowedKeys.has(key)) return;
        if (key === 'e') {
            console.log(`Engine ${engine ? 'Started' : 'Stopped'}.`);
            setEngine(!engine);
            return;
        }

        if (!engine) return;
        setPressedKeys((prevKeys) => {
            const newKeys = new Set(prevKeys);
            newKeys.add(key);
            return newKeys;
        });

        if (key === 'w') setMove('w');
        if (key === 's') setMove('s');
        if (key === 'a') setDirection('a');
        if (key === 'd') setDirection('d');
        if (key === 'shift' && move) startIncreasingSpeed();
    };


    const handleInputUp = (key: string) => {
        if (!allowedKeys.has(key)) return;

        // Engine logic is set to toggle and not hold
        if (key === 'e') return;

        if (!engine) return;

        setPressedKeys((prevKeys) => {
            const newKeys = new Set(prevKeys);
            newKeys.delete(key);
            return newKeys;
        });

        if (key === 'shift' || !move) startDecreasingSpeed();
        if (key === 'w' || key === 's') setMove(false);
        if (key === 'a' || key === 'd') setDirection(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        console.log(key);
        handleInputDown(key);
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        handleInputUp(key);
    }

    const setEventListeners = () => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    };

   // Add `pressedKeys` dependency to ensure effect cleanup on updates


    const getMoveStatus = (move: string | boolean): string => {
        if (move === "w") {
            return "Forward";
        } else if (move === "s") {
            return "Backward";
        }
        return "Not Moving";
    };

    const getDirectionStatus = (move: string | boolean): string => {
        if (move === "a") {
            return "Left";
        } else if (move === "d") {
            return "Right";
        }
        return "No Direction";
    };

    /** Starts increasing speed at intervals until it reaches MAX_SPEED */
    const startIncreasingSpeed = () => {
        if (!speedInterval.current) {
            console.log('Shift pressed, increasing speed...');
            speedInterval.current = setInterval(() => {
                setSpeed((prevSpeed) => {
                    if (prevSpeed >= MAX_SPEED) {
                        stopSpeedChange();
                        return MAX_SPEED;
                    }
                    return prevSpeed + SPEED_INCREASE_RATE;
                });
            }, SPEED_INTERVAL_MS);
        }
    };
    /** Starts decreasing speed until it reaches 0 */
    const startDecreasingSpeed = () => {
        console.log('Shift released, decreasing speed...');
        stopSpeedChange();

        speedInterval.current = setInterval(() => {
            setSpeed((prevSpeed) => {
                if (prevSpeed <= BASE_SPEED) {
                    stopSpeedChange();
                    return BASE_SPEED;
                }
                return prevSpeed - SPEED_DECREASE_RATE;
            });
        }, SPEED_INTERVAL_MS);
    };

    /** Stops any ongoing speed changes */
    const stopSpeedChange = () => {
        if (speedInterval.current) {
            clearInterval(speedInterval.current);
            speedInterval.current = null;
        }
    };

    /** Get overall status in JSON */
    const getStatus = (): MoveDetails => {
        return {
            engine: engine,
            move: {
                isMoving: move !== false,  // True if moving, false otherwise
                value: move ? String(move) : "None"  // Move direction or "None" if not moving
            },
            direction: {
                isTurning: direction !== false,  // True if turning, false otherwise
                value: direction ? String(direction) : "None"  // Turning direction or "None" if not turning
            },
            speed: speed
        };
    };

    const moveStats = getMoveStatus(move);
    const directionStats = getDirectionStatus(direction);


    // // Trigger the ServicePage whenever any of the state variables change
    // useEffect(() => {
    //     // This effect runs whenever the engine, move, direction, or speed changes
    //
    // }, [engine, move, direction, speed]);  // Add dependencies for all states you want to trigger on

    // const sendTestServer=()=>{
    //     sendData("toggle");
    // };
    return (
        <>
            <div className={"grid grid-cols-2 gap-2 justify-center"}>
                {//this will be the info div
                }
                <div className={"flex flex-col justify-start items-start"}>
                    <h1>Engine Control Panel</h1>
                    <p>Engine Status: {engine ? "ON" : "OFF"}</p>
                    <p>Moving Status: {moveStats}</p>
                    <p>Direction Status: {directionStats}</p>
                    <p>Speed: {speed}</p>
                    <p>Status: {JSON.stringify(getStatus())}</p>
                    <p>Pressed keys: {Array.from(pressedKeys).join(', ')}</p>
                </div>

                <div>
                    <div className={"flex flex-row justify-center items-center mb-2"}>
                        <Button value={"w"} color={""} handlePressed={() => handleInputDown("w")}
                                handleReleased={() => handleInputUp("w")} handleEngineState={engine}
                                handleIsKeyPressed={pressedKeys}></Button>
                    </div>
                    <div className={"flex flex-row justify-center gap-2 items-center "}>
                        <Button value={"a"} handleReleased={() => handleInputUp("a")}
                                handlePressed={() => handleInputDown("a")} color={""} handleEngineState={engine}
                                handleIsKeyPressed={pressedKeys}></Button>
                        <Button value={"s"} handleReleased={() => handleInputUp("s")}
                                handlePressed={() => handleInputDown("s")} color={""} handleEngineState={engine}
                                handleIsKeyPressed={pressedKeys}></Button>
                        <Button value={"d"} handleReleased={() => handleInputUp("d")}
                                handlePressed={() => handleInputDown("d")} color={""} handleEngineState={engine}
                                handleIsKeyPressed={pressedKeys}></Button>
                    </div>
                </div>


                <div>
                    <button
                        onMouseDown={() => handleInputDown('shift')}
                        onMouseUp={() => handleInputUp('shift')}
                        onTouchStart={() => handleInputDown('shift')}
                        onTouchEnd={() => handleInputUp('shift')}
                        className={pressedKeys.has('shift') ? 'active' : ''}
                    > Boost
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => handleInputDown('e')}
                        className={engine ? 'active' : ''}
                    >
                        {engine ? "Stop Engine" : "Start Engine"}
                    </button>
                    <button className="btn btn-soft btn-accent">Accent</button>
                </div>
            </div>
        </>

    );
}

