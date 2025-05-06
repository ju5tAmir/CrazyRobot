#pragma once

#include "ServoMotor.h"
#include <vector>
#include <memory>

#define MAX_SERVOS 10


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
