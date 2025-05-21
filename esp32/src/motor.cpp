#include <fns.h>
#include <Arduino.h> 
#include <esp32-hal-gpio.h>


//default speed
const int MOVE_SPEED = 190;
void moveRobotTwo(Direction dir, int leftSpeed, int rightSpeed, Motor leftMotor, Motor rightMotor) {
  switch (dir) {
      case FORWARD:
          leftMotor.setSpeed(leftSpeed);
          rightMotor.setSpeed(rightSpeed);
          break;

      case BACKWARD:
          leftMotor.setSpeed(-leftSpeed);
          rightMotor.setSpeed(-rightSpeed);
          break;

      case LEFT:
          leftMotor.setSpeed(-leftSpeed);
          rightMotor.setSpeed(rightSpeed);
          break;

      case RIGHT:
          leftMotor.setSpeed(leftSpeed);
          rightMotor.setSpeed(-rightSpeed);
          break;

      case FORWARD_LEFT:
          leftMotor.setSpeed(leftSpeed * 0.94); 
          rightMotor.setSpeed(rightSpeed);
          break;

      case FORWARD_RIGHT:
          leftMotor.setSpeed(leftSpeed);
          rightMotor.setSpeed(rightSpeed * 0.94);
          break;

      case BACKWARD_LEFT:
          leftMotor.setSpeed(-leftSpeed * 0.94);
          rightMotor.setSpeed(-rightSpeed);
          break;

      case BACKWARD_RIGHT:
          leftMotor.setSpeed(-leftSpeed);
          rightMotor.setSpeed(-rightSpeed * 0.94);
          break;

      case STOP:
          leftMotor.stop();
          rightMotor.stop();
          break;
default:
         break;
  }
}

      

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
    pinMode(IN1,OUTPUT);
    pinMode(IN2,OUTPUT);
    pinMode(IN3,OUTPUT);
    pinMode(IN4,OUTPUT);
}






