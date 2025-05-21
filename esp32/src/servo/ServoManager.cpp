#include "ServoManager.h"


ServoManager::ServoManager() : pwm(), initialized(false)  {

};


bool ServoManager::setup() {
    pwm.begin();
    pwm.setPWMFreq(SERVO_FREQ);
    // for (int i=0; i < SERVO_COUNT ; i++) {
    //    // To set the servos to their initial angle
    //    setTarget(i, servos[i].init, true);
    //    }
    initialized = true;
    return initialized;
};


void ServoManager::setServoAngle(uint8_t channel, int angle) {
    angle = constrain(angle, 0, 180);
    int pulse = map(angle, 0, 180, SERVO_MIN, SERVO_MAX);
    pwm.setPWM(channel, 0, pulse);
};


void ServoManager::moveServo(ServoID id, int angle) {
    setServoAngle(static_cast<uint8_t>(id), angle);
};




void ServoManager::moveEyesDown() {
  setTarget(3, 85);
  setTarget(4, 115);
}

void ServoManager::moveEyesUp() {
  // setTarget(3, 135);
  // setTarget(4, 70);
  setTarget(3,135,true);
  setTarget(4,65,true);


}

void ServoManager::lookUp() {
  setTarget(1, 10);
}

void ServoManager::lookDown() {
  setTarget(1, 180);
}

void ServoManager::headsUp() {
  setTarget(1, 180);
  setTarget(2, 180);
}

void ServoManager::headsDown() {
  setTarget(1, 10);
  setTarget(2, 10);
}

void ServoManager::init() {
  delay(2000);
  for (int i=0; i<SERVO_COUNT; i++){
    setTarget(i, servos[i].init);
  }

  initialized = !initialized;
}

void ServoManager::move(ServoData &servo) {
    if (!servo.isMoving) return;

    unsigned long current = millis();
    if (current - servo.previous >= servo.interval && servo.steps > 0) {
        Serial.println(" ==== BEFORE ==== " );

        Serial.println("Previous: " );
        Serial.println(String(servo.previous));
        Serial.println("Current: " );
        Serial.println(String(current));
        status(servo);

        setServoAngle(servo.id, servo.angle);

        Serial.print("PWM: " );
        Serial.println(String(pwm.getPWM(servo.id)));
        servo.angle += servo.step;

        servo.steps--;
        servo.previous = current;

        Serial.println(" ==== AFTER ==== " );

        Serial.println("Previous: " );
        Serial.println(String(servo.previous));
        Serial.println("Current: " );
        Serial.println(String(current));
        status(servo);

        if (servo.steps == 0) {
            servo.isMoving = false;
            setServoAngle(servo.id, servo.target); // Final adjustment
            servo.angle = servo.target;
            servo.direction = 1;
            Serial.println("Movement complete.");
        }
    }
}

void ServoManager::status(ServoData &servo) {
    Serial.print("ID: " );
    Serial.println(String(servo.id));

    Serial.print("Initial: " );
    Serial.println(String(servo.init));

    Serial.print("Steps: " );
    Serial.println(String(servo.steps));

    Serial.print("Current Angle: " );
    Serial.println(String(servo.angle));

    Serial.print("Target Angle: " );
    Serial.println(String(servo.target));

    Serial.print("Direction: " );
    Serial.println(String(servo.direction));

    Serial.print("Intervals: " );
    Serial.println(String(servo.interval));

    Serial.print("Step Size: " );
    Serial.println(String(servo.step));

    Serial.print("Global Step Size: " );
    Serial.println(String(servo.gstep));

    Serial.print("IsMoving: " );
    Serial.println(String(servo.isMoving));
}


int ServoManager::getStep(int start, int finish, int step) {
  if (finish - start > 0) {
    return abs(step);  // Ensure it's positive
  }

  return -abs(step);   // Ensure it's negative
}

// 0 - 180 : 3000
// It will return the time needs to finish the turn relative to 0 - 180 in 3 seconds
int ServoManager::calculateTime(int start, int finish) {
    return abs(finish - start ) * 3000 / 180;
};

// 5 degrees each
int ServoManager::calculateSteps(int start, int finish, int step) {
    return abs((start - finish) / step) ;
};


int ServoManager::calculateStepSize(int time, int steps) {
    return round(time / steps);
};

int ServoManager::getDirection(int start, int finish) {
    if (finish - start > 0){
      return 1;
    }

    return -1;
};


void ServoManager::setTarget(int servoId, int newTarget) {
    ServoData &servo = servos[servoId];

    servo.target = constrain(newTarget, servo.min, servo.max);

    servo.direction = getDirection(servo.angle, servo.target);
    servo.step = servo.direction * servo.gstep;
    servo.steps = calculateSteps(servo.angle, servo.target, servo.step);
    servo.isMoving = true;
    servo.previous = millis();
    Serial.println("=== INIT ===");
    status(servo);
};


























// void ServoManager::moveServos(int start, int finish) {
//     int time = calculateTime(start, finish);
//     int steps = calculateSteps(start, finish);
//     int stepSize = calculateStepSize(time, steps);
//     unsigned long currentMillis = millis();
//
//     Serial.print("Time: ");
//     Serial.println(String(time));
//
//     Serial.print("Steps: ");
//     Serial.println(String(steps));
//
//     Serial.print("Size: ");
//     Serial.println(String(stepSize));
//
//     Serial.print("Current Millis: ");
//     Serial.println(String(currentMillis));
// };

// /**
//  * Head Movements Diagram
//  *
//  *   .------R1-----.-------R2------.
//  *   |             |               |
//  *   L             C               R
//  *  180            95              0
//  */
// void ServoManager::headMoves(Position position) {
//     switch (position) {
//
//         case LEFT:
//             setServoAngle(SERVO_CONFIGS[HEAD].channel, 180);
//             break;
//
//         case CENTER:
//             setServoAngle(SERVO_CONFIGS[HEAD].channel, 95);
//             break;
//
//         case RIGHT:
//             setServoAngle(SERVO_CONFIGS[HEAD].channel, 0);
//             break;
//
//         default:
//             setServoAngle(SERVO_CONFIGS[HEAD].channel, 95);
//             break;
//     };
// };
//
//
// /**
//  * Neck Top Movements Diagram
//  *
//  *   .------R1-----.-------R2------.
//  *   |             |               |
//  *   L             C               R
//  *  180           105              0
//  */
// void ServoManager::neckTMoves(Position position) {
//     switch (position) {
//
//         case UP:
//             setServoAngle(SERVO_CONFIGS[NECKT].channel, 180);
//             break;
//
//         case DOWN:
//             setServoAngle(SERVO_CONFIGS[NECKT].channel, 0);
//             break;
//
//         default:
//             setServoAngle(SERVO_CONFIGS[NECKT].channel, 0);
//             break;
//     };
// };
//
//
// /**
//  * Neck Bottom Movements Diagram
//  *
//  *   .------R1-----.-------R2------.
//  *   |             |               |
//  *   L             C               R
//  *  180           105              0
//  */
// void ServoManager::neckBMoves(Position position) {
//     switch (position) {
//
//         case UP:
//             setServoAngle(SERVO_CONFIGS[NECKB].channel, 180);
//             break;
//
//         case DOWN:
//             setServoAngle(SERVO_CONFIGS[NECKB].channel, 0);
//             break;
//
//         default:
//             setServoAngle(SERVO_CONFIGS[NECKB].channel, 0);
//             break;
//     };
// };
//
//
// /**
//  * Left Eye Diagram
//  *
//  *   .------R1-----.-------R2------.
//  *   |             |               |
//  *   L             C               R
//  *  180           105              0
//  */
// void ServoManager::leftEyeMoves(Position position) {
//     switch (position) {
//
//         case UP:
//             setServoAngle(SERVO_CONFIGS[LEYE].channel, 70);
//             break;
//
//         case DOWN:
//             setServoAngle(SERVO_CONFIGS[LEYE].channel, 0);
//             break;
//
//         default:
//             setServoAngle(SERVO_CONFIGS[LEYE].channel, 0);
//             break;
//     };
// };
//
