#pragma once

#include "ServoMotor.h"
#include "ServoDefinitions.h"


class ServoManager {
private:
    ServoMotor* servos[MAX_SERVOS];
    int servoCount;
    bool initialized;


public:
    // Constructor
    ServoManager();

    // Destructor
    ~ServoManager();

    bool setup();
    void addServo(int pin, int initialPos, int minPos, int maxPos);
};
