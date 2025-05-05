#include "ServoManager.h"

ServoManager::ServoManager() {
    for (int i = 0; i < NUM_SERVOS; i++) {
        servos[i] = new ServoMotor(pins[i]);
    }
}

ServoManager::~ServoManager() {
    for (int i = 0; i < NUM_SERVOS; i++) {
        delete servos[i];
    }
}

void ServoManager::setup() {
    for (int i = 0; i < NUM_SERVOS; i++) {
        int maxVal = preset[i][0];
        int minVal = preset[i][1];

        if (minVal > maxVal) {
            int temp = minVal;
            minVal = maxVal;
            maxVal = temp;
        }

        servos[i]->setMinAngle(minVal);
        servos[i]->setMaxAngle(maxVal);
        servos[i]->setInitialAngle((minVal + maxVal) / 2);
        servos[i]->attach();
    }
}

ServoMotor* ServoManager::getServo(int index) {
    if (index >= 0 && index < NUM_SERVOS) {
        return servos[index];
    }
    return nullptr;
}

