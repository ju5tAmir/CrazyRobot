#ifndef ServoMotor_h
#define ServoMotor_h

#include <Arduino.h>
#include <ESP32Servo.h>

class ServoMotor {
private:
    Servo esp32servo;
    int pin = 0;
    int minAngle = 0;
    int maxAngle = 0;
    int currentAngle = 0;
    int initialAngle = 0;

public:
    ServoMotor(int pin);

    void attach();
    void write(int angle);
    void setMinAngle(int angle);
    void setMaxAngle(int angle);
    void setInitialAngle(int angle);
    int getMinAngle() const { return minAngle; }
    int getMaxAngle() const { return maxAngle; }
    int getCurrentAngle() const { return currentAngle; }
};
#endif
