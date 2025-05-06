#pragma once

enum ServoID {
    HEAD = 0,
    NECK,
    LEYE,
    REYE,
    LHAND,
    RHAND,

    SERVO_COUNT
};

struct ServoConfig {
    int pin;
    int initialAngle;
    int minAngle;
    int maxAngle;
    const char* name;
};

const ServoConfig SERVO_CONFIGS[SERVO_COUNT] = {
    // ID             PIN   INIT  MIN  MAX   NAME
    { /* HEAD */       13,   90,   0,  180,  "Head" },
    { /* NECK */       12,   45,  10,  170,  "Neck" },
    { /* LEYE */       14,   90,  30,  150,  "LeftEye" },
    { /* REYE */       27,   90,   0,  180,  "RightEye" },
    { /* LHAND */      26,   90,   0,  180,  "LeftHand" },
    { /* RHAND */      25,   50,   0,  100,  "RightHand" }
};

inline const char* getServoName(ServoID id) {
    if (id >= 0 && id < SERVO_COUNT) {
        return SERVO_CONFIGS[id].name;
    }
    return "Unknown";
}

// Helper functions to get other servo parameters
inline int getServoPin(ServoID id) {
    return (id >= 0 && id < SERVO_COUNT) ? SERVO_CONFIGS[id].pin : -1;
}

inline int getServoInitialAngle(ServoID id) {
    return (id >= 0 && id < SERVO_COUNT) ? SERVO_CONFIGS[id].initialAngle : 90;
}

inline int getServoMinAngle(ServoID id) {
    return (id >= 0 && id < SERVO_COUNT) ? SERVO_CONFIGS[id].minAngle : 0;
}

inline int getServoMaxAngle(ServoID id) {
    return (id >= 0 && id < SERVO_COUNT) ? SERVO_CONFIGS[id].maxAngle : 180;
}
