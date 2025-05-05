#include <fns.h>
#include <Arduino.h> 
#include <esp32-hal-gpio.h>


// void moveRobotTwo(Direction dir, int leftSpeed, int rightSpeed,Motor leftMotor,Motor rightMotor) {
//         switch (dir) {
//           case FORWARD:
//             leftMotor.setSpeed(leftSpeed);
//             rightMotor.setSpeed(rightSpeed);
//             break;
//           case BACKWARD:
//             leftMotor.setSpeed(-leftSpeed);
//             rightMotor.setSpeed(-rightSpeed);
//             break;
//           case LEFT:
//             leftMotor.setSpeed(-leftSpeed);
//             rightMotor.setSpeed(rightSpeed);
//             break;
//           case RIGHT:
//             leftMotor.setSpeed(leftSpeed);
//             rightMotor.setSpeed(-rightSpeed);
//             break;
//           case STOP:
//             leftMotor.stop();
//             rightMotor.stop();
//             break;
//         }
// }



void moveRobotTwo(Direction dir, int leftSpeed, int rightSpeed, Motor leftMotor, Motor rightMotor) {
  static bool braking = false;
  static int brakeSpeed = 0;
  static int brakeStep = 0;
  static int brakeTicksRemaining = 0;
  if (dir == BRAKING) {
    if (!braking) {
      braking = true;
      brakeSpeed = leftSpeed;
      brakeTicksRemaining = 6;  
      brakeStep = leftSpeed / brakeTicksRemaining;
    }
    if (brakeTicksRemaining > 0) {
      leftMotor.setSpeed(brakeSpeed);
      rightMotor.setSpeed(brakeSpeed);
      brakeSpeed -= brakeStep;
      brakeTicksRemaining--;
    } else {
      leftMotor.stop();
      rightMotor.stop();
      braking = false;
    }
    return;
  } else {
    braking = false; 
  }
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
          leftMotor.setSpeed(leftSpeed * 0.5); 
          rightMotor.setSpeed(rightSpeed);
          break;

      case FORWARD_RIGHT:
          leftMotor.setSpeed(leftSpeed);
          rightMotor.setSpeed(rightSpeed * 0.5);
          break;

      case BACKWARD_LEFT:
          leftMotor.setSpeed(-leftSpeed * 0.5);
          rightMotor.setSpeed(-rightSpeed);
          break;

      case BACKWARD_RIGHT:
          leftMotor.setSpeed(-leftSpeed);
          rightMotor.setSpeed(-rightSpeed * 0.5);
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






