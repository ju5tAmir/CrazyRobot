#ifndef ServoManager_h
#define ServoManager_h

#include "ServoMotor.h"

class ServoManager {
private:
    static const int NUM_SERVOS = 7;
    ServoMotor* servos[NUM_SERVOS];

    // Pins and calibration presets
    int pins[NUM_SERVOS] = {
        13,
        12,
        14,
        27,
        26,
        25,
        33
    };


    int preset[NUM_SERVOS][2] = {
        {410, 120},  // head rotation
        {532, 178},  // neck top
        {120, 310},  // neck bottom
        {465, 271},  // eye right
        {278, 479},  // eye left
        {340, 135},  // arm left
        {150, 360}   // arm right
    };

public:
    ServoManager();
    ~ServoManager();

    void setup();
    ServoMotor* getServo(int index);
    int getServoCount() const { return NUM_SERVOS; }
};

#endif

