import { useState, useEffect, useRef } from 'react';
import MoveDetails from '../../mqtt/mqttComponents/MoveDetails.ts';
import { Button } from './Button.tsx';
import { useMqtt } from '../../hooks';

export default function Motor() {
  const { messages, publish } = useMqtt();
  const topic = import.meta.env.VITE_MQTT_TOPIC;

  const SPEED_INCREASE_RATE = 5;
  const SPEED_DECREASE_RATE = 10;
  const SPEED_INTERVAL_MS = 150;
  const BASE_SPEED = 150;
  const MAX_SPEED = 255;

  const allowedKeys = new Set(['w', 'a', 's', 'd', 'e', 'shift', 'space']);

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const pressedKeysRef = useRef<Set<string>>(new Set());

  const [engine, setEngine] = useState<boolean>(false);
  const [move, setMove] = useState<string | boolean>(false);
  const [direction, setDirection] = useState<string | boolean>(false);
  const [speed, setSpeed] = useState<number>(BASE_SPEED);

  const speedInterval = useRef<NodeJS.Timeout | null>(null);

  // Event Listeners Setup
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    messages.forEach((m) => console.log(m));
  }, [messages]);

  useEffect(() => {
    publish(topic, {
      engine,
      move: {
        isMoving: move !== false,
        value: move ? String(move) : 'None',
      },
      direction: {
        isTurning: direction !== false,
        value: direction ? String(direction) : 'None',
      },
      speed,
    });

    console.log(`Engine ${engine ? 'Started' : 'Stopped'}.`);
  }, [engine, move, direction, speed]);

  const handleInputDown = (value: string) => {
    const key = value.toLowerCase();
    if (!allowedKeys.has(key)) return;

    if (pressedKeysRef.current.has(key)) return; // Already pressed, ignore

    setPressedKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.add(key);
      pressedKeysRef.current = newKeys;

      // Key logic
      if (key === 'e') {
        setEngine(true);
        console.log('Engine Started.');
        return newKeys;
      }

      if (!engine) return prev;

      if (key === 'w') setMove('w');
      if (key === 's') setMove('s');
      if (key === 'a') setDirection('a');
      if (key === 'd') setDirection('d');
      if (key === 'shift' && move) {
        startIncreasingSpeed();
      }

      return newKeys;
    });
  };

  const handleInputUp = (value: string) => {
    const key = value.toLowerCase();
    if (!allowedKeys.has(key)) return;
    if (!engine) return;
    if (key === 'e') return; // Engine toggle only on down

    setPressedKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete(key);
      pressedKeysRef.current = newKeys;
      return newKeys;
    });

    if (key === 'shift' || !move) startDecreasingSpeed();
    if (key === 'w' || key === 's') setMove(false);
    if (key === 'a' || key === 'd') setDirection(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    handleInputDown(e.key);
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    handleInputUp(e.key);
  };

  const startIncreasingSpeed = () => {
    if (!speedInterval.current) {
      console.log('Starting to boost...');
      speedInterval.current = setInterval(() => {
        setSpeed((prev) => {
          if (prev >= MAX_SPEED) {
            stopSpeedChange();
            return MAX_SPEED;
          }
          return prev + SPEED_INCREASE_RATE;
        });
      }, SPEED_INTERVAL_MS);
    }
  };

  const startDecreasingSpeed = () => {
    console.log('Decreasing speed...');
    stopSpeedChange();
    speedInterval.current = setInterval(() => {
      setSpeed((prev) => {
        if (prev <= BASE_SPEED) {
          stopSpeedChange();
          return BASE_SPEED;
        }
        return prev - SPEED_DECREASE_RATE;
      });
    }, SPEED_INTERVAL_MS);
  };

  const stopSpeedChange = () => {
    if (speedInterval.current) {
      clearInterval(speedInterval.current);
      speedInterval.current = null;
    }
  };

  const getMoveStatus = (move: string | boolean): string => {
    if (move === 'w') return 'Forward';
    if (move === 's') return 'Backward';
    return 'Not Moving';
  };

  const getDirectionStatus = (direction: string | boolean): string => {
    if (direction === 'a') return 'Left';
    if (direction === 'd') return 'Right';
    return 'No Direction';
  };

  const getStatus = (): MoveDetails => ({
    engine,
    move: {
      isMoving: move !== false,
      value: move ? String(move) : 'None',
    },
    direction: {
      isTurning: direction !== false,
      value: direction ? String(direction) : 'None',
    },
    speed,
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Engine Control Panel</h1>
          <p>Engine Status: {engine ? 'ON' : 'OFF'}</p>
          <p>Moving Status: {getMoveStatus(move)}</p>
          <p>Direction Status: {getDirectionStatus(direction)}</p>
          <p>Speed: {speed}</p>
          <p>Status: {JSON.stringify(getStatus())}</p>
          <p>Pressed keys: {Array.from(pressedKeys).join(', ')}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <Button
              value="w"
              color=""
              handlePressed={() => handleInputDown('w')}
              handleReleased={() => handleInputUp('w')}
              handleEngineState={engine}
              handleIsKeyPressed={pressedKeys}
            />
          </div>

          <div className="flex justify-center gap-4">
            <Button
              value="a"
              color=""
              handlePressed={() => handleInputDown('a')}
              handleReleased={() => handleInputUp('a')}
              handleEngineState={engine}
              handleIsKeyPressed={pressedKeys}
            />
            <Button
              value="s"
              color=""
              handlePressed={() => handleInputDown('s')}
              handleReleased={() => handleInputUp('s')}
              handleEngineState={engine}
              handleIsKeyPressed={pressedKeys}
            />
            <Button
              value="d"
              color=""
              handlePressed={() => handleInputDown('d')}
              handleReleased={() => handleInputUp('d')}
              handleEngineState={engine}
              handleIsKeyPressed={pressedKeys}
            />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onMouseDown={() => handleInputDown('shift')}
              onMouseUp={() => handleInputUp('shift')}
              onTouchStart={() => handleInputDown('shift')}
              onTouchEnd={() => handleInputUp('shift')}
              className={`btn ${
                pressedKeys.has('shift') ? 'bg-purple-600' : ''
              }`}
            >
              Boost
            </button>

            <button
              onClick={() => handleInputDown('e')}
              className={`btn ${engine ? 'bg-red-600' : 'bg-green-600'}`}
            >
              {engine ? 'Stop Engine' : 'Start Engine'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
