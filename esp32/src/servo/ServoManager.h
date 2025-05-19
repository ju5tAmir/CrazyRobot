#pragma once

#include "ServoDefinitions.h"

class ServoManager {
private:
    Adafruit_PWMServoDriver pwm;
    bool initialized;

    void headMoves(Position position);
    void neckTMoves(Position position);
    void neckBMoves(Position position);
    void leftEyeMoves(Position position);
public:
    ServoManager();

    bool setup();
    void setServoAngle(uint8_t channel, int angle);
    void moveServo(ServoID id, int angle);
    void moveServo(ServoID id, Position position);

};

