#pragma once

#include "ServoMotor.h"
#include "ServoDefinitions.h"


class ServoManager {
private:
    ServoMotor* servos[SERVO_COUNT];
    int servoCount;
    bool initialized;


public:
    // Constructor
    ServoManager();

    // Destructor
    ~ServoManager();

    bool setup();
    bool move(ServoID id, int angle);
    ServoMotor* getServo(ServoID id);
};
