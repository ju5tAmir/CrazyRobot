#include <fns.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h> 


void moveRobot(Direction dir, int speed) {
    switch (dir) {
        case FORWARD:
            digitalWrite(IN1, LOW);
            digitalWrite(IN2, HIGH);
            digitalWrite(IN3, LOW);
            digitalWrite(IN4, HIGH);
            break;
        case BACKWARD:
            digitalWrite(IN1, HIGH);
            digitalWrite(IN2, LOW);
            digitalWrite(IN3, HIGH);
            digitalWrite(IN4, LOW);
            break;
        case  RIGHT:
          digitalWrite(IN1, LOW);
          digitalWrite(IN2, HIGH);
          digitalWrite(IN3, LOW);
          digitalWrite(IN4, LOW);

             break;    
        case  LEFT:
             digitalWrite(IN1, LOW);
             digitalWrite(IN2, LOW);
             digitalWrite(IN3, LOW);
             digitalWrite(IN4, HIGH);
   
                break;    
        case STOP:
            digitalWrite(IN1, LOW);
            digitalWrite(IN2, LOW);
            digitalWrite(IN3, LOW);
            digitalWrite(IN4, LOW);
            break;
    }
    ledcWrite(pwmChannel1, speed);
    ledcWrite(pwmChannel2, speed);
}

void setupMotors(){
    pinMode(ENA,OUTPUT);
    pinMode(ENB,OUTPUT);
    pinMode(IN1,OUTPUT);
    pinMode(IN2,OUTPUT);
    pinMode(IN3,OUTPUT);
    pinMode(IN4,OUTPUT);
    ledcSetup(pwmChannel1, freq, resolution);  
    ledcAttachPin(ENA, pwmChannel1);  
    ledcSetup(pwmChannel2, freq, resolution);  
    ledcAttachPin(ENB, pwmChannel2); 
}




