#pragma once

#include "ServoDefinitions.h"

class ServoManager {
private:
    Adafruit_PWMServoDriver pwm;
    bool initialized;
public:
    ServoManager();

    bool setup();
    void setServoAngle(uint8_t channel, int angle);
    void moveServo(ServoID id, int angle);

};

