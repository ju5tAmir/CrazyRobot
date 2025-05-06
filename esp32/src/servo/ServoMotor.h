#pragma once

#include <Arduino.h>
#include <ESP32Servo.h>
#include "ServoDefinitions.h"

class ServoMotor {
private:
    Servo servo;
    ServoID id;
    int pin;
    int minAngle;
    int maxAngle;
    int currentAngle;
    int initialAngle;
    bool isAttached;

public:
    ServoMotor(ServoID id, int servoPin, int initialPos, int minPos, int maxPos);

    bool init();
    bool moveTo(int angle);
    void setMinAngle(int angle);
    void setMaxAngle(int angle);
    void setInitialAngle(int angle);
    int getMinAngle() const;
    int getMaxAngle() const;
    int getCurrentAngle() const;
    bool isValidAngle(int angle) const;
};

