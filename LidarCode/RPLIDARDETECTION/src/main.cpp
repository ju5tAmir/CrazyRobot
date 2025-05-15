#include <Arduino.h>
#define RX 25
#define RTT 26
#define led 2
#include "LIDAR/lidar.h"
#include "models/models.h"
#include "commands/commands.h"

//serial to communicate with the motor controll microcontroller
HardwareSerial TransmitSerial(1);
unsigned long lastChecked = 0;
unsigned long lidarChecktimer =200;

// put function declarations here:
int myFunction(int, int);
LidarState lidarState = LidarState();
void readReceivedMessages(HardwareSerial &serial,LidarState &lidarState);
boolean readLidarcommand(String message);
// void upddateObstaclesPerRegion(LidarState &lidar, HardwareSerial &serial);
void upddateObstaclesPerRegion(Obstacle* obstacles,int count,HardwareSerial &serial);

void setup() {
   Serial.begin(115200);
  // put your setup code here, to run once:
     TransmitSerial.begin(115200, SERIAL_8N1, RX, RTT);

}

void loop() {
  if(TransmitSerial.available()){
   readReceivedMessages(TransmitSerial,lidarState);
  }

  if(lidarState.lidarReady){
    readLidarData(&lidarState);
    if(lidarState.fullScanForProcessing){
       int readIndex = lidarState.activeBufferIndex;
   lidarState.activeBufferIndex = 1 - lidarState.activeBufferIndex; 
    Obstacle* readBuffer = lidarState.obstacleBuffers[readIndex];
    int count = lidarState.obstacleCounts[readIndex];
     upddateObstaclesPerRegion(readBuffer,count,LidarSerial);
     lidarState.fullScanForProcessing=false;
    }   
  }

}

// put function definitions here:
int myFunction(int x, int y) {
  return x + y;
}


// this method can be improved to handle the state when lidar could not be turned off 
void readReceivedMessages(HardwareSerial &serial,LidarState &liadrState){
String line = serial.readStringUntil('#');
line.trim();
line+=Terminator;
if(line.startsWith("L")){
 boolean lidarStateOn = readLidarcommand(line);
 if(lidarStateOn){
  boolean isStarted = initializeHardware(liadrState);  
  Serial.println("Receiver: Initialization completed.");
  String response = isStarted ? LidarOn : LidarOff;
  lidarState.lidarReady=isStarted;
    serial.println(response);
    Serial.println(response);
    serial.println("Response sent");
 }else{
  stopLidar(liadrState);
    lidarState.lidarReady=false;
    liadrState.collectingScan=false;
   serial.println(LidarOff);
 }
}
}


//read start stopCommand for the lidar 
boolean readLidarcommand(String message) {
 Serial.println("arrived LIDAR message: " + message);
 if(message==LidarOn){
  return true;
 }else if(message==LidarOff){
  return false;
 }else{
   Serial.println("arrived LIDAR message invalid " + message);
 }
  return false;
}


// void upddateObstaclesPerRegion(LidarState &lidar,HardwareSerial &serial){
//            for (int i = 0; i < 4; i++) {
//             warnings[i] = FREE;
//         }

//           for (int i = 0; i <lidar.currentObstaclesCount; i++) {
//               Obstacle obs = lidar.obstacles[i];
//               float angle = obs.startAngle;
//               float end = obs.endAngle;
//               float dist = obs.distance;
//               Serial.println(dist);
//               Serial.println("distance");
//               Serial.println(angle);
//               Serial.println("anglestart");
//               Serial.println(end);
//               Serial.println("angle end");
//               if (dist > 600) continue;
//               const String dir = getDirectionForAngle(angle);
//               int index = directionIndex(dir);
//                if (index == -1) continue;
//               if (dist >= 200 && dist<=350) {
//                   warnings[index] = SEVERE; 
//                } else if ((dist > 350 && dist <=500) && warnings[index] != SEVERE) {
//                  warnings[index] = MILD;
//               } 
//           }
         

//           boolean changed = false;
//           String warning ="";
//         for (int i = 0; i < 4; i++) {
//           if(warnings[i]!=lastWarnings[i]){
//             changed=true;
//             break;
//           } }

//          if (changed) {
//         String warning = "";
//         for (int i = 0; i < 4; i++) {
//             if (i != 0) {
//                 warning += ",";
//             }
//             warning += warnings[i];
//             lastWarnings[i] = warnings[i];
//         }
         
//         serial.println(warning+=Terminator);
//         Serial.print("Warning changed in direction: ");
//         Serial.println(warning); 
//     }
//   }


void upddateObstaclesPerRegion(Obstacle* obstacles,int count,HardwareSerial &serial){
           for (int i = 0; i < 4; i++) {
            warnings[i] = FREE;
        }

          for (int i = 0; i <count; i++) {
              Obstacle obs = obstacles[i];
              float angle = obs.startAngle;
              float end = obs.endAngle;
              float dist = obs.distance;
              Serial.println(dist);
              Serial.println("distance");
              Serial.println(angle);
              Serial.println("anglestart");
              Serial.println(end);
              Serial.println("angle end");
              if (dist > 600) continue;
              const String dir = getDirectionForAngle(angle);
              int index = directionIndex(dir);
               if (index == -1) continue;
              if (dist >= 200 && dist<=350) {
                  warnings[index] = SEVERE; 
               } else if ((dist > 350 && dist <=500) && warnings[index] != SEVERE) {
                 warnings[index] = MILD;
              } 
          }
         

          boolean changed = false;
          String warning ="";
        for (int i = 0; i < 4; i++) {
          if(warnings[i]!=lastWarnings[i]){
            changed=true;
            break;
          } }

         if (changed) {
        String warning = "";
        for (int i = 0; i < 4; i++) {
            if (i != 0) {
                warning += ",";
            }
            warning += warnings[i];
            lastWarnings[i] = warnings[i];
        }
         
        serial.println(warning+=Terminator);
        Serial.print("Warning changed in direction: ");
        Serial.println(warning); 
    }
  }





// void sendWarning(String message){


// }
 //   if (!robot.isStopped) {
  //     unsigned long currentMillis = millis();
  
  //     if (currentMillis - lastCheckTime >= measureLidar) {
  //         lastCheckTime = currentMillis;
  //         Obstacle localObstacles[NUM_BUCKETS];
  //         int localCounter=0;
  //         if (xSemaphoreTake(robotMutex, pdMS_TO_TICKS(50))) {
  //           localCounter=robot.currentObstaclesCount;
  //             for (int i = 0; i < NUM_BUCKETS; i++) {
  //                 localObstacles[i] = robot.obstacles[i];
  //             }
  //             xSemaphoreGive(robotMutex);
  //         } else {
  //             Serial.println("Failed to get robotMutex in loop");
  //             return;
  //         }

  //         for (int i = 0; i < 4; i++) {
  //           warnings[i] = FREE;
  //       }

  //         for (int i = 0; i <localCounter; i++) {
  //             Obstacle obs = localObstacles[i];
  //             float angle = obs.startAngle;
  //             float end = obs.endAngle;
  //             float dist = obs.distance;
  //             Serial.println(dist);
  //             Serial.println("distance");
  //             Serial.println(angle);
  //             Serial.println("anglestart");
  //             Serial.println(end);
  //             Serial.println("angle end");
  //             if (dist > 600) continue;
  //             const String dir = getDirectionForAngle(angle);
  //             int index = directionIndex(dir);

  //              if (index == -1) continue;

  //             if (dist >= 250 && dist<=300) {
  //                 warnings[index] = SEVERE; 
  //              } else if ((dist > 300 && dist <=500) && warnings[index] != SEVERE) {
  //                warnings[index] = MILD;
  //             } 
  //         }
         
  //       for (int i = 0; i < 4; i++) {
  //         if(warnings[i]!=lastWarnings[i]){
  //           sendDistanceWarning(warnings[i], directions[i]); 
  //           lastWarnings[i]=warnings[i];
  //         }
             
  //        }


  //     }
  // }
