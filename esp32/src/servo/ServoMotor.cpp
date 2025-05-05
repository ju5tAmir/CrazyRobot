#include "ServoMotor.h"

ServoMotor::ServoMotor(int pin) : pin(pin) {}


void ServoMotor::attach() {
    esp32servo.attach(pin);
}


void ServoMotor::write(int angle) {
    esp32servo.write(angle);
}
