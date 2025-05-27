#pragma once

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#define SERVO_MIN  100
#define SERVO_MAX  580
#define SERVO_FREQ 60
#define SERVO_COUNT 7
#define INTERVAL 3000 // takes 3 seconds to a full 180


enum ServoID : uint8_t {
    HEAD = 0,
    NECKT,
    NECKB,
    LEYE,
    REYE,
    LHAND,
    RHAND,
};

struct ServoData {
    int id;                  // Channel id on the sensor 0 - 16
    int init;                // Initial angle
    int min;                 // Min angle
    int max;                 // Max angle
    int angle;               // Current angle
    int target;              // Target angle to reach
    int step;                // Number of degrees which robots will move in each iteration (e.g. -5, +3)
    int gstep;               // Constant value and multiplies to the step size
    int steps;               // Number of iterations which needs to reach the destination based on (step * gstep)
    int direction;           // Determines if the iteration should be backward (e.g. 180 to 90) or upward (e.g. 90 to 180)
    int interval;            // Number of seconds to wait for an iteration
    unsigned long previous;  // previously registered time
    bool isMoving;           // Is Moving
};

extern ServoData servos[SERVO_COUNT];
