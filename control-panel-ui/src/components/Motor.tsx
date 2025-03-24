// Notes: There is an issue with increasing speed when speed is already set to decrease.
//      : When shift is pressed, w or s doesn't work.
//
import React, { useState, useEffect, useRef } from 'react';
import { ServicePage } from '../mqtt/mqttComponents/ServicePage.tsx';
import MoveDetails from '../mqtt/mqttComponents/MoveDetails';


export default function Motor() {
    const SPEED_INCREASE_RATE = 5;
    const SPEED_DECREASE_RATE = 10;
    const SPEED_INTERVAL_MS = 150;
    const BASE_SPEED = 150; // It's different in each motor
    const MAX_SPEED = 255;

    const [pressedKeys, setPressedKeys] = useState<Set<string>> (new Set ());
    const allowedKeys = new Set (['w', 'a', 's', 'd', 'e', 'shift', 'space']);
    const [engine, setEngine] = useState<boolean> (false);
    const [move, setMove] = useState<string | boolean> (false);
    const [direction, setDirection] = useState<string | boolean> (false);
    const [speed, setSpeed] = useState<number> (BASE_SPEED);
    const speedInterval = useRef<NodeJS.Timeout | null> (null); // Store interval reference


    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase ();
        if (!allowedKeys.has (key)) return;


        // Engine Toggle Stop Logic
        if (key == 'e' && pressedKeys.has (key)) {
            setPressedKeys ((prevKeys) => {
                const newKeys = new Set (prevKeys);
                newKeys.delete (key);
                setEngine (false);
                console.log (`Engine Stopped.`);

                return newKeys;
            });
        }

        if (!pressedKeys.has (key)) {  // Check if thkey is already pressed
            setPressedKeys ((prevKeys) => {
                const newKeys = new Set (prevKeys);
                newKeys.add (key);

                // Key logics
                if (key === 'e') {
                    setEngine (true);
                    console.log (`Engine Started.`);
                    return newKeys;
                }
                ;

                if (!engine) return prevKeys;

                if (key === 'w') setMove ('w');
                if (key === 's') setMove ('s');
                if (key === 'a') setDirection ('a');
                if (key === 'd') setDirection ('d');
                if (key === 'shift' && move) {
                    startIncreasingSpeed ();
                    console.log ('hi');
                }

                return newKeys;
            });
        }
        ;
    };


    const handleKeyUp = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase ();
        if (!allowedKeys.has (key)) return;

        // Engine logic is set to toggle and not hold
        if (key == 'e') return;

        if (!engine) {
            return;
        }
        setPressedKeys ((prevKeys) => {
            const newKeys = new Set (prevKeys);
            newKeys.delete (key);

            if (key === 'shift' || !move) startDecreasingSpeed ();
            if (key === 'w' || key === 's') setMove (false);
            if (key === 'a' || key === 'd') setDirection (false);

            console.log (`${key} released`);
            return newKeys;
        });
    };

    const setEventListeners = () => {
        window.addEventListener ('keydown', handleKeyDown);
        window.addEventListener ('keyup', handleKeyUp);
    };

    useEffect (() => {
        setEventListeners ();

        // Cleanup the event listeners when the component unmounts
        return () => {
            window.removeEventListener ('keydown', handleKeyDown);
            window.removeEventListener ('keyup', handleKeyUp);
        };
    }, [pressedKeys]);  // Add `pressedKeys` dependency to ensure effect cleanup on updates


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
            console.log ('Shift pressed, increasing speed...');
            speedInterval.current = setInterval (() => {
                setSpeed ((prevSpeed) => {
                    if (prevSpeed >= MAX_SPEED) {
                        stopSpeedChange ();
                        return MAX_SPEED;
                    }
                    return prevSpeed + SPEED_INCREASE_RATE;
                });
            }, SPEED_INTERVAL_MS);
        }
    };
    /** Starts decreasing speed until it reaches 0 */
    const startDecreasingSpeed = () => {
        console.log ('Shift released, decreasing speed...');
        stopSpeedChange ();

        speedInterval.current = setInterval (() => {
            setSpeed ((prevSpeed) => {
                if (prevSpeed <= BASE_SPEED) {
                    stopSpeedChange ();
                    return BASE_SPEED;
                }
                return prevSpeed - SPEED_DECREASE_RATE;
            });
        }, SPEED_INTERVAL_MS);
    };

    /** Stops any ongoing speed changes */
    const stopSpeedChange = () => {
        if (speedInterval.current) {
            clearInterval (speedInterval.current);
            speedInterval.current = null;
        }
    };

    /** Get overall status in JSON */
    const getStatus = (): MoveDetails => {
        return {
            engine: engine,
            move: {
                isMoving: move !== false,  // True if moving, false otherwise
                value: move || "None"  // Move direction or "None" if not moving
            },
            direction: {
                isTurning: direction !== false,  // True if turning, false otherwise
                value: direction || "None"  // Turning direction or "None" if not turning
            },
            speed: speed
        };
    };


    /** Get overall status in JSON */
    const publishMessage = () => {

    };


    const moveStats = getMoveStatus (move);
    const directionStats = getDirectionStatus (direction);


    // Trigger the ServicePage whenever any of the state variables change
    useEffect(() => {
        // This effect runs whenever the engine, move, direction, or speed changes
    }, [engine, move, direction, speed]);  // Add dependencies for all states you want to trigger on


    return (
        <>
            <h1>Engine Control Panel</h1>
            <p>Engine Status: {engine ? "ON" : "OFF"}</p>
            <p>Moving Status: {moveStats}</p>
            <p>Direction Status: {directionStats}</p>
            <p>Speed: {speed}</p>
            <p>Status: {JSON.stringify (getStatus ())}</p>
            <p>Pressed keys: {Array.from (pressedKeys).join (', ')}</p>


            <button onClick={() => {
                console.log (getStatus ())
            }

            }>Send Data
            </button>

            <ServicePage data={getStatus ()}/>
        </>
    );
}

