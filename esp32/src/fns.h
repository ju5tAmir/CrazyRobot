#include <esp32-hal-ledc.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h>
#include "models/models.h"
#ifndef FNS_h
#define FNS_h

#define IN1 4
#define IN2 12
#define IN3 13
#define IN4 2
#define ENA 25 
#define ENB 26


const int pwmChannel1 = 1;
const int pwmChannel2 = 2;
const int resolution = 8;
class Motor {
  private:
    int in1, in2;
    int pwmPin;
    int channel;
 
  static const int freq = 30000;
  static const int resolution = 8;
  public:
    Motor(int _in1, int _in2, int _pwmPin, int _channel) {
      in1 = _in1;
      in2 = _in2;
      pwmPin = _pwmPin;
      channel = _channel;
  
      pinMode(in1, OUTPUT);
      pinMode(in2, OUTPUT);
      ledcSetup(channel, freq, resolution);
      ledcAttachPin(pwmPin, channel);
    }
  
    void setSpeed(int speed) {
      bool forward = speed >= 0;
      digitalWrite(in1, forward ? HIGH : LOW);
      digitalWrite(in2, forward ? LOW : HIGH);
      ledcWrite(channel, constrain(abs(speed), 0, 255));
    }
  
    void stop() {
      digitalWrite(in1, LOW);
      digitalWrite(in2, LOW);
      ledcWrite(channel, 0);
    }
  };

extern Motor leftMotor; 
extern Motor rightMotor;
void moveRobot(Direction dir, int speed) ;
void moveRobotTwo(Direction dir, int leftSpeed, int rightSpeed,Motor leftMotor,Motor rightMotor);
void moveRobot(Direction dir, int speed) ;
void setupMotors();


#endif
