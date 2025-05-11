#include <RPLidar.h>
#include "models/models.h"
#include "fns.h"
#include "mqtt/mqtt.h"
#include <ESP32Servo.h>
#include <ServoEasing.hpp>
#include "lidar/lidar.h"
#include <ArduinoJson.h>
#include "messages/messages.h"
#include  "obstacles/obstacles.h"
#include "ir/ir.h"

// Create servo manager instance - automatically loads all servo configurations
// ServoManager servoManager;

Motor rightMotor(IN1, IN2, ENA, pwmChannel1); 
Motor leftMotor(IN4, IN3, ENB, pwmChannel2);
ServoEasing myServo;
RobotData robot = RobotData();

void actOnMovements();
void checkRobotState(RobotData& robot);
void stopEngines();

//Todo move them in another 
bool isMovementAllowed(char(&activeMovements)[4],char currentMovement,int size);
void removeAllowedMovement(char (&allowedMovements)[4], char target);
void addAllowedMovement(char (&allowedMovements)[4], char target);


//Timing for the ir sensor
unsigned long lastDangerTime = 0;
unsigned long startedMesurement = 0;
unsigned long lastLidarMesurement =0; 
const unsigned long negativeHoldDelay = 500;
const unsigned long holdDelay = 1000;
//lidar readings and processing
const unsigned long  measureLidar = 200;
String getDirectionForAngle(float angle);


int initializeRetries= 3;
int countRetries=0;
unsigned long lastCheckTime = 0;
static unsigned long lastWarnTime = 0;


//Thread management for lidar thread
TaskHandle_t lidarTaskHandle;
void lidarTask(void* pvParameters);

void setup() {
  analogReadResolution(12);
  Serial.begin(115200); 
connectWiFi();
connectMQTT(&robot);
setupMotors();


xTaskCreatePinnedToCore(
  lidarTask,
  "LidarTask",
  8192,
  &robot,
  1,
  &lidarTaskHandle,
  1
);

}

void loop() {

    if(WiFi.status()!=WL_CONNECTED){
        connectWiFi();
    }
    if(!client.connected()){
        connectMQTT(&robot);
    }
    client.loop(); 
    unsigned long currentMillis = millis();
    checkRobotState(robot);
  
    if (!robot.isStopped) {
      unsigned long currentMillis = millis();
  
      if (currentMillis - lastCheckTime >= measureLidar) {
          lastCheckTime = currentMillis;
          Obstacle localObstacles[NUM_BUCKETS];
          int localCounter=0;
          if (xSemaphoreTake(robotMutex, pdMS_TO_TICKS(50))) {
            localCounter=robot.currentObstaclesCount;
              for (int i = 0; i < NUM_BUCKETS; i++) {
                  localObstacles[i] = robot.obstacles[i];
              }
              xSemaphoreGive(robotMutex);
          } else {
              Serial.println("Failed to get robotMutex in loop");
              return;
          }
          for (int i = 0; i < 4; i++) {
            warnings[i] = FREE;
        }
          for (int i = 0; i <localCounter; i++) {
              Obstacle obs = localObstacles[i];
              float angle = obs.startAngle;
              float dist = obs.distance;
              Serial.println(dist);
              Serial.println("distance");

              Serial.println(angle);
              Serial.println("angle");

              if (dist > 600) continue;
              const String dir = getDirectionForAngle(angle);
              int index = directionIndex(dir);

               if (index == -1) continue;

              if (dist >= 250 && dist<=300) {
                  warnings[index] = SEVERE; 
               } else if ((dist > 300 && dist <=500) && warnings[index] != SEVERE) {
                 warnings[index] = MILD;
              } 
          }
         

        for (int i = 0; i < 4; i++) {
          if(warnings[i]!=lastWarnings[i]){
            sendDistanceWarning(warnings[i], directions[i]); 
            lastWarnings[i]=warnings[i];
          }
             
         }


      }
  }
}

void actOnMovements() {
  bool foundW = false, foundS = false, foundA = false, foundD = false;

  for (int i = 0; i < 4; i++) {
    char movement = robot.activeMovements[i];
    if (movement == '-') continue;
    switch (movement) {
      case 'w': foundW = true; break;
      case 's': foundS = true; break;
      case 'a': foundA = true; break;
      case 'd': foundD = true; break;
    }
  }

  if ((foundW && foundS) || (foundA && foundD)) {
      moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
    return;
  }

  if (foundA ) {
    moveRobotTwo(LEFT, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    return;
  }


  if (foundD) {
    moveRobotTwo(RIGHT, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    return;
  }

  if (foundW) {
    if (isMovementAllowed(robot.allowedMovements, 'w', 4)) {
      moveRobotTwo(FORWARD, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    } else {
      moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
    }
    return;
  }

  if (foundS) {
    moveRobotTwo(BACKWARD, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    return;
  }


  if (!foundW && !foundS && !foundD && !foundA) {
    moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
  }
}


void stopEngines(){
  moveRobotTwo(STOP,0,0,leftMotor,rightMotor);  
}

void checkRobotState(RobotData& robot){
  if (robot.initializing){
   bool  lidarReadyTemp = initializeHardware();
    if(lidarReadyTemp){
       robot.initializing=false;
       robot.isStopped=false;  
       robot.lidarReady=true; 
       xTaskNotifyGive(lidarTaskHandle);
       sendInitializeMessage(false,"");
    }else{
      robot.lidarReady=false;
      robot.initializing=false;
      robot.isStopped=true;
      stopLidar();
      xTaskNotifyGive(lidarTaskHandle);
      sendInitializeMessage(true,InitializeError);
      Serial.println("error occured while starting");
    }
    return;
  }

  if(robot.isStopped ){
    return;  
 }

  //Add retry to stop if stop fails
  if(robot.isStopping){
    Serial.println("Stopping");
    bool stopped = stopLidar();
    if(stopped){
      robot.lidarReady=false;
      robot.isStopped=true;
      sendTurnOffMessage("");
      stopEngines();
    }else{
      robot.lidarReady=false;
      robot.isStopped=true;
      sendTurnOffMessage(StopError);
      stopEngines();
    }
    return;
  }

// check if the sensor reads an negative space and waits for half second for the sensor to read positive space until will reset back
  checkForNegativeSpace();
 
  if(smoothedIr>=threshold){

  if(!isMovementAllowed(robot.activeMovements,'w',4)){
   return;
  } 
     if (startedMesurement == 0) {
    startedMesurement = millis();
  }
  if (!robot.negativeDanger && millis()-startedMesurement>=negativeHoldDelay) {
      lastDangerTime = millis(); 
      removeAllowedMovement(robot.allowedMovements, 'w');
      sendNegativeWarning(SEVERE);
      robot.negativeDanger = true;  
  }
} else {
  if (robot.negativeDanger && millis() - lastDangerTime >= holdDelay) {
    startedMesurement=0;
    addAllowedMovement(robot.allowedMovements, 'w');
    sendNegativeWarning(FREE);
    robot.negativeDanger = false;
  }
  }

  actOnMovements();
}


void lidarTask(void* pvParameters) {
  RobotData* robot = (RobotData*)pvParameters;

  while (true) {
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
   // Serial.println("[LIDAR Task] Notification received, starting scan,outside");
    while (robot->lidarReady) {
      readLidarData(robot);
     // Serial.println("[LIDAR Task] Notification received, starting scan inside");
      vTaskDelay(30 / portTICK_PERIOD_MS);
      yield();
    }

   // Serial.println("[LIDAR Task] Scan stopped, waiting again...");
  }
}


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

String getDirectionForAngle(float angle) {
  if (angle >= 315 || angle <= 45) {
      return FT; 
  } else if (angle > 45 && angle <= 135) {
      return RT; 
  } else if (angle > 135 && angle <= 225) {
      return BK; 
  } else {
      return LT;
  }
}







