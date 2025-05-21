// #include "obstacles.h"
// #include "../mqtt/mqtt.h"
// #include "../messages/messages.h"
// Direction  allowedMovement[]= {FORWARD, BACKWARD,RIGHT,LEFT,STOP};
#include "../models/models.h"
#include  "../messages/messages.h"


void removeAllowedMovement(char (&allowedMovements)[4], char target) {
  for (int i = 0; i < 4; i++) {
    if (allowedMovements[i] == target) {
      allowedMovements[i] = '_';
      break;
    }
  }
}

void addAllowedMovement(char (&allowedMovements)[4], char target) {
  for (int i = 0; i < 4; i++) {
    if (allowedMovements[i] == target) return;
  }

  for (int i = 0; i < 4; i++) {
    if (allowedMovements[i] == '_') {
      allowedMovements[i] = target;
      break;
    }
  }
}

bool isMovementAllowed(char(&activeMovements)[4],char currentMovement,int size){
  for (int i = 0; i < size; ++i) {
    if (activeMovements[i] == currentMovement) {
      return true;
    }
  }
  return false;
}


/// @brief process the warning form the lidar and remove or add allowed directions bassed on severity
/// @param robotState  the object that represents the robot
void processDirectionSeverity(String &warnings,RobotData &robotState){
  if(warnings.length()<=0){
      return;
  }
  //severe warning for the front direction
if(warnings[0]==Severe_Warning){
   removeAllowedMovement(robotState.allowedMovements,frontCommand);
}else {
   addAllowedMovement(robotState.allowedMovements,frontCommand);
}
 //severe warning for the back direction
if(robotState.lidarWarnings[2]==Severe_Warning){
 removeAllowedMovement(robotState.allowedMovements,backCommand);
}else {
   addAllowedMovement(robotState.allowedMovements,backCommand);
}
}


// int obstacleCount = 0;
// float frontDangerSum = 0;
// int frontDangerCount = 0;

// float leftDangerSum = 0;
// int leftDangerCount = 0;

// float rightDangerSum = 0;
// int rightDangerCount = 0;

// float backDangerSum = 0;
// int backDangerCount = 0;




// bool checkIfCanMove(float averageDistance){
//     return averageDistance>=400;
//   }
  
  
//   void removeMovement(Direction moveToRemove) {
//       for (int i = 0; i < 5; i++) {
//         if (allowedMovement[i] == moveToRemove) {
//           allowedMovement[i] = NONE;
//           break;
//         }
//       }
//     }
  
    
//     void addMovement(Direction moveToAdd) {
//       for (int i = 0; i < 5; i++) {
//         if (allowedMovement[i] == moveToAdd) {
//           return; // already there
//         }
//       }
      
  
//       for (int i = 0; i < 5; i++) {
//         if (allowedMovement[i] == NONE) {
//           allowedMovement[i] = moveToAdd;
//           break;
//         }
//       }
//     }
  
//     bool isDirectionAllowed(Direction dir) {
//       for (int i = 0; i < 5; i++) {
//         if (allowedMovement[i] == dir) return true;
//       }
//       return false;
//     }


//     float getClosestFrontObstacleDistance(RobotData* robot) {
//         float closest = 9999;
//         // for (int i = 0; i < obstacleCount; i++) {
//         //     int start = robot->obstacles[i].startAngle;
//         //     int end = robot->obstacles[i].endAngle;
            
//         //     if ((start <= 15 || start >= 345) || (end <= 15 || end >= 345)) {
//         //         if (robot->obstacles[i].distance < closest) {
//         //             closest = robot->obstacles[i].distance;
//         //         }
//         //     }
//         // }
//         return closest;
//     }

//     void CheckAvailableSpace(float frontAvg, float rightAvg, float leftAvg, float backAvg) {
//         bool canBackward = checkIfCanMove(backAvg);
//         bool canLeft = checkIfCanMove(leftAvg);
//         bool canRight = checkIfCanMove(rightAvg);
//         bool canForward = checkIfCanMove(frontAvg);
//         bool stopped = false;
    
//         if (!canForward) {
//           //  moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
//             removeMovement(FORWARD);
//             stopped = true;
//             Serial.println("Obstacle detected in FRONT! Stopping...");
    
//             if (canLeft) addMovement(LEFT);
//             if (canRight) addMovement(RIGHT);
//             if (canBackward) addMovement(BACKWARD);
//         }
    
//         if (!canBackward) {
//             if(!stopped){
//             //    moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
//                 stopped = true;
//             }
//             removeMovement(BACKWARD);
//             Serial.println("Obstacle detected in BACK!");
           
//             if (canForward) addMovement(FORWARD);
//             if (canLeft) addMovement(LEFT);
//             if (canRight) addMovement(RIGHT);
//         }
//         if (!canLeft) {
//             removeMovement(LEFT);
//             Serial.println("Obstacle detected on LEFT!");
//         }
    
    
//         if (!canRight) {
//             removeMovement(RIGHT);
//             Serial.println("Obstacle detected on RIGHT!");
//         }
    
//         if (!stopped && canForward) {
//             // digitalWrite(red, LOW);
//             // digitalWrite(green, HIGH);
//             Serial.println("Front Clear: Move Forward");
//             addMovement(FORWARD); 
//             addMovement(LEFT); 
//             addMovement(BACKWARD);  
//             addMovement(RIGHT); 
//         }
//         else {
//             // digitalWrite(red, HIGH);
//             // digitalWrite(green, LOW);
//         }
//     }

// //just for
//  // 72 represents the size off the  detected obstacles array 
//     boolean detectObstacles (RobotData * robot){
//          String front = "";
//          String left ="";
//          String right = "";
//          String back = "";
    
//          for(int i=0; i<72;i++){
          
//             if(robot->obstacles[i].distance>=300){
//                  if(checkFront(robot->obstacles[i])){
//                    return true;
//                  }
//             }
//          }
//          return false;
//     }


//     //check if object is in the front 315 to 45  degrees
//     boolean checkFront(Obstacle obstacle){
//         return (obstacle.startAngle >= 315 || obstacle.startAngle <= 45);
//     }

//     boolean checkLeft(Obstacle obstacle){
//         return (obstacle.startAngle>=225 || obstacle.startAngle<=314);
//     }

//     boolean checkRight(Obstacle obstacle){
//         return (obstacle.startAngle>=46 || obstacle.startAngle<=135);
//     }

//     boolean checkBack(Obstacle obstacle){
//         return (obstacle.startAngle>=136 || obstacle.startAngle<=224);
//     }


 



    
//     bool isApproachingObstacle(const Obstacle& current, const Obstacle& previous, float angleTolerance = 10.0, float distanceThreshold = 100.0) {

//         bool angleMatch = fabs(current.startAngle - previous.startAngle) < angleTolerance &&
//                           fabs(current.endAngle - previous.endAngle) < angleTolerance;
    
//         if (!angleMatch) return false;
//         float distanceDelta = previous.distance - current.distance;
//         return distanceDelta > distanceThreshold;  
//     }


//     float estimateApproachSpeed(const Obstacle& current, const Obstacle& previous, float dtSeconds) {
//         return (previous.distance - current.distance) / dtSeconds; // mm/s
//     }
    