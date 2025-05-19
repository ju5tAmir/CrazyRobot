#pragma once

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#define SERVO_MIN  100
#define SERVO_MAX  580
#define SERVO_FREQ 60
#define SERVO_COUNT 7


enum ServoID : uint8_t {
    HEAD = 0,
    NECKT,
    NECKB,
    LEYE,
    REYE,
    LHAND,
    RHAND,
};

struct ServoConfig {
    int channel;
    int init;
    int current;
    int min;
    int max;
    const char* name;
};

const ServoConfig SERVO_CONFIGS[SERVO_COUNT] = {
    // ID             CHA  INIT   CRNT    MIN   MAX   NAME
    { /* HEAD */       0,   90,    90,     0,   180,  "Head" },
    { /* NECKT */      1,    0,     0,     0,   180,  "NeckTop" },
    { /* NECKB */      2,   30,    30,    30,   180,  "NeckBottom" },
    { /* LEYE */       3,   90,    90,    30,   150,  "LeftEye" },
    { /* REYE */       4,   90,    90,     0,   180,  "RightEye" },
    { /* LHAND */      5,   90,    90,     0,   180,  "LeftHand" },
    { /* RHAND */      6,   50,    50,     0,   100,  "RightHand" }
};


