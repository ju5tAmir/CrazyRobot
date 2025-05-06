#include "ServoManager.h"


ServoManager::ServoManager() : initialized(false) {
    for (int i = 0; i < SERVO_COUNT; i++) {
        ServoID id = static_cast<ServoID>(i);
        const ServoConfig& config = SERVO_CONFIGS[i];

        servos[i] = new ServoMotor(
            id,
            config.pin,
            config.initialAngle,
            config.minAngle,
            config.maxAngle
        );
    }
}


ServoManager::~ServoManager() {
    for (int i = 0; i < SERVO_COUNT; i++) {
        if (servos[i] != nullptr) {
            delete servos[i];
            servos[i] = nullptr;
        }
    }
}


bool ServoManager::setup() {
    bool allInitialized = true;

    for (int i=0; i < servoCount; i++) {
        if (servos[i] != nullptr) {
           if (servos[i]->init()) {
                Serial.printf("Failed to initialize servo: %s\n", i);
                allInitialized = false;
            }
        }
    }

    initialized = allInitialized;
    return initialized;
}
