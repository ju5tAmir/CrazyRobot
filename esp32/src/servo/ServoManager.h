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
    void moveEyesDown();
    void moveEyesUp();
    void lookUp();
    void lookDown();
    void headsUp();
    void headsDown();
    void init();
    void update();
    void move(ServoData &servo);
    void status(ServoData &servo);
    int getStep(int start, int finish, int step);
    int calculateTime(int start, int finish);
    int calculateSteps(int start, int finish, int step);
    int calculateStepSize(int time, int steps);
    int getDirection(int start, int finish);
    void setTarget(int servoId, int newTarget);
    void setTarget(int servoId, int newTarget, bool action);
};

extern ServoManager servoManager;
