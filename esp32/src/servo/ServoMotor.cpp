#include "ServoMotor.h"

ServoMotor::ServoMotor(int servoPin, int initialPos, int minPos, int maxPos) :
    pin(servoPin),
    minAngle(minPos),
    maxAngle(maxPos),
    initialAngle(initialPos),
    currentAngle(initialPos),
    isAttached(false)
{}


bool ServoMotor::init() {
    if (isAttached) {
        return true;
    }

    if (servo.attach(pin)) {
        isAttached = true;

        return moveTo(initialAngle);
    }

    return false;
}


bool ServoMotor::moveTo(int angle) {
    if (!isAttached) {
        return false;
    }

    if (!isValidAngle(angle)) {
        return false;
    }

    servo.write(angle);
    currentAngle = angle;
    return true;
}


bool ServoMotor::isValidAngle(int angle) const {
    return (angle >= minAngle && angle <= maxAngle);
}


int ServoMotor::getMinAngle() const {
    return minAngle;
}


int ServoMotor::getMaxAngle() const {
    return maxAngle;
}


int ServoMotor::getCurrentAngle() const {
    return currentAngle;
}

