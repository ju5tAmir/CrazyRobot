#ifndef MOTOR_h
#define MOTOR_h

#include <fns.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h>
#include <enums.h>


void setupMotors();
void moveRobot(Move move, int speed);
void engineSwitch(EngineStatus status);

void moveRobot(Move move, int speed) {
    switch (move) {
        case FORWARD:
            digitalWrite(IN1, LOW);
            digitalWrite(IN2, HIGH);
           //  digitalWrite(IN3, LOW);
           //  digitalWrite(IN4, HIGH);
            Serial.println("Moving robot forward");
            break;
        case BACKWARD:
            digitalWrite(IN1, HIGH);
            digitalWrite(IN2, LOW);
           //  digitalWrite(IN3, HIGH);
            // digitalWrite(IN4, LOW);
            break;
    }
    ledcWrite(pwmChannel1, speed);
    // ledcWrite(pwmChannel2, speed);
}


void engineSwitch(EngineStatus status) {
    switch (status) {
        case EngineStatus::OFF:
            digitalWrite(IN1, LOW);
            digitalWrite(IN2, LOW);
            Serial.println("Engine Stopped");
            break;
        case EngineStatus::ON:
            digitalWrite(IN1, HIGH);
            digitalWrite(IN2, LOW);
            ledcWrite(pwmChannel1, 0);
            Serial.println("Engine started with 0 speed.");
            break;
    }
}


void setupMotors(){
    pinMode(ENA,OUTPUT);
    //  pinMode(ENB,OUTPUT);
    pinMode(IN1,OUTPUT);
    pinMode(IN2,OUTPUT);
    // ledcAttachChannel(ENA, freq, resolution, pwmChannel1);

    //  pinMode(IN3,OUTPUT);
    //  pinMode(IN4,OUTPUT);
    ledcSetup(pwmChannel1, freq, resolution);
    ledcAttachPin(ENA, pwmChannel1);
    //  ledcSetup(pwmChannel2, freq, resolution);
    //  ledcAttachPin(ENB, pwmChannel2);
    Serial.println("Motor Setup Done");
}

#endif
