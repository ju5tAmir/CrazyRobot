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
unsigned long lastDangerTime = 0;
const unsigned long holdDelay = 500;

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
// myServo.attach(servo);
// myServo.setEasingType(EASE_CUBIC_IN_OUT);  // Smooth curve
// myServo.startEaseTo(90, 2000); 

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
    checkRobotState(robot);
    unsigned long currentMillis = millis();
    if (buzzerActive) {
        if (currentMillis - buzzerStartTime >= buzzerDuration) {
            // 100 ms passed -> stop buzzer
            digitalWrite(buzzer, LOW);
            buzzerActive = false;
            Serial.println("Buzzer OFF");
        }
    }

 // readLidarData();

//  if (isDirectionAllowed(FORWARD)) {
    // moveRobotTwo(FORWARD, 170, 170, leftMotor, rightMotor);
 // }
  // else if (isDirectionAllowed(LEFT) && isDirectionAllowed(RIGHT)) {
  //   moveRobotTwo(LEFT, 255, 255, leftMotor, rightMotor);
  // }
  // else if (isDirectionAllowed(BACKWARD)) {
  //   moveRobotTwo(BACKWARD, 150, 150, leftMotor, rightMotor);
  // }
  // else {
  //   moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
  //   Serial.println("All directions blocked! Stopping.");
  // }
}

void actOnMovements() {
  bool foundW = false, foundS = false, foundA = false, foundD = false;

  for (int i = 0; i < 4; i++) {
    const char* movement = robot.activeMovements[i];
    if (movement == nullptr) continue;

    for (int j = 0; movement[j] != '\0'; j++) {
      switch (movement[j]) {
        case 'w': foundW = true; break;
        case 's': foundS = true; break;
        case 'a': foundA = true; break;
        case 'd': foundD = true; break;
      }
    }
  }

  if (foundW && foundS) {
    moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
    return;
  }

  if (foundD && foundA) {
    moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
    return;
  }

  if (foundA || (foundW && foundA) || (foundS && foundA)) {
    moveRobotTwo(LEFT, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    return;
  }

  if (foundD || (foundW && foundD) || (foundS && foundD)) {
    moveRobotTwo(RIGHT, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    return;
  }

  if (foundW && isMovementAllowed(robot.allowedMovements,'w',4) ) {
    moveRobotTwo(FORWARD, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
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



//   unsigned long currentTime = millis();
// if (currentTime - lastCheckTime >= 200) {
//     lastCheckTime = currentTime;

//     bool dangerFront = false;

//     portENTER_CRITICAL(&obstacleMux);
//     dangerFront = detectObstacles(&robot);  
//     portEXIT_CRITICAL(&obstacleMux);       

  
//     if (millis() - lastWarnTime >= 1000) {
//         lastWarnTime = millis();
//         sendDistanceWarning(BRAKE, "front");
//     }
// }

// if(checkForNegativeSpace(robot)){
//   if(!robot.negativeDanger){
//     Serial.println(robot.negativeDanger);
//     removeAllowedMovement(robot.allowedMovements,'w');
//     sendNegativeWarning(SEVERE); 
//     robot.negativeDanger=true;
 
//   }  
// }else{
//   Serial.println(robot.negativeDanger);
//   addAllowedMovement(robot.allowedMovements,'w');
//   robot.negativeDanger=false;
// }


// check if the sensor reads an negative space and waits for hals second for the sensor to read positive space until will reset back
if (checkForNegativeSpace(robot)) {
  lastDangerTime = millis(); 
  if (!robot.negativeDanger) {
    removeAllowedMovement(robot.allowedMovements, 'w');
    sendNegativeWarning(SEVERE);
    robot.negativeDanger = true;
  }
} else {
  if (robot.negativeDanger && millis() - lastDangerTime >= holdDelay) {
    addAllowedMovement(robot.allowedMovements, 'w');
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







