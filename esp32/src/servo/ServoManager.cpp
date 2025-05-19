#include "ServoManager.h"


ServoManager::ServoManager() : pwm(), initialized(false)  {

};


bool ServoManager::setup() {
    pwm.begin();
    pwm.setPWMFreq(SERVO_FREQ);
    for (int i=0; i < SERVO_COUNT ; i++) {
         // Moving servos to their initial state
         setServoAngle(SERVO_CONFIGS[i].channel, SERVO_CONFIGS[i].init);
         }
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
