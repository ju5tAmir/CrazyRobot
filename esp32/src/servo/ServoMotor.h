#ifndef ServoMotor_h
#define ServoMotor_h

#include <Arduino.h>
#include <ESP32Servo.h>

class ServoMotor {
private:
    Servo servo;
    int pin;
    int minAngle;
    int maxAngle;
    int currentAngle;
    int initialAngle;
    bool isAttached;

public:
    ServoMotor(int servoPin, int initialPos, int minPos, int maxPos);

    bool init();
    bool moveTo(int angle);
    void setMinAngle(int angle);
    void setMaxAngle(int angle);
    void setInitialAngle(int angle);
    int getMinAngle() const;
    int getMaxAngle() const;
    int getCurrentAngle() const;
    bool isValidAngle(int angle) const;
};
#endif
