#include "ServoManager.h"


ServoManager::ServoManager() : initialized(false) {
}


void ServoManager::addServo(int pin, int initialPos, int minPos, int maxPos) {
    servos[servoCount] = new ServoMotor(pin, initialPos, minPos, maxPos);
    servoCount++;
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
