#include <RPLidar.h>
#include "models/models.h"
#include "fns.h"
#include "mqtt/mqtt.h"
#include <ESP32Servo.h>
#include <ServoEasing.hpp>
#include <ArduinoJson.h>
#include "messages/messages.h"
#include  "obstacles/obstacles.h"
#include "ir/ir.h"
#include "serialRead/uartSer.h"
<<<<<<< HEAD
#include "battery/battery.h"
=======
#include "servo/ServoManager.h"
>>>>>>> 7ea425020162b7f63fbddecbc3a2a95a293398f1


// Create servo manager instance - automatically loads all servo configurations
// ServoManager servoManager;

Motor rightMotor(IN1, IN2, ENA, pwmChannel1);
Motor leftMotor(IN4, IN3, ENB, pwmChannel2);
ServoEasing myServo;
RobotData robot = RobotData();
HardwareSerial LidarSerial(2);
MessageQueue lidarResponseQueue = MessageQueue();
void actOnMovements();
void checkRobotState(RobotData& robot,HardwareSerial &serial);
void stopEngines();

void  sendLidarCommands(String message,HardwareSerial &serial);




//Timing for the ir sensor
unsigned long lastDangerTime = 0;
unsigned long startedMesurement = 0;
unsigned long lastLidarMesurement =0; 
const unsigned long negativeHoldDelay = 500;
const unsigned long holdDelay = 1000;
//lidar readings and processing
const unsigned long  measureLidar = 200;
//wait for the second esp to respond back for maximum 6 seconds
const unsigned long timeoutMs = 6000;
const unsigned long timeoutStopResponse =1000;
unsigned long startTimeToWaitForResponse = 0;
bool requestToLidarSent = false;
bool requestToLidarSentStop = false;
unsigned long startTimeStop = 0;
int initializeRetries= 3;
int countRetries=0;
unsigned long lastCheckTime = 0;
static unsigned long lastWarnTime = 0;


void setup() {
  analogReadResolution(12);
  Serial.begin(115200); 
 LidarSerial.begin(115200, SERIAL_8N1, RPLIDAR_RX, RPLIDAR_TX);
  while (LidarSerial.available()) LidarSerial.read();
connectWiFi();
connectMQTT(&robot);
setupMotors();
setBatteryMeter();
    if (servoManager.setup()) {
        Serial.println("Servo Setup Successfull");

        static bool moved = false;
        if (!moved) {
            moved = true;
        }


    } else {
        Serial.println("Servo Setup Failed.");
    };
}

void loop() {

    if(WiFi.status()!=WL_CONNECTED){
        connectWiFi();
    }
    if(!client.connected()){
        connectMQTT(&robot);
    }
    client.loop();
    servoManager.update();

      String msg;
  if (readSerialMessage(LidarSerial, msg)) {
    msg.trim();
    if (msg.startsWith("L:")) {
      unsigned long currentMills =millis();
      lidarResponseQueue.push(msg,currentMills);
    } else {
      robot.lidarWarnings = msg;
      processDirectionSeverity(msg,robot);
      sendDistanceWarningNew(msg);
    }
  }

    checkRobotState(robot,LidarSerial);


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
    if (isMovementAllowed(robot.allowedMovements, frontCommand, 4)) {
      moveRobotTwo(FORWARD, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    } else {
      moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
    }
    return;
  }

  if (foundS) {
        if (isMovementAllowed(robot.allowedMovements, frontCommand, 4)) {
      moveRobotTwo(BACKWARD, MOVE_SPEED, MOVE_SPEED, leftMotor, rightMotor);
    } else {
      moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
    }
    return;
  }

  if (!foundW && !foundS && !foundD && !foundA) {
    moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
  }
}


void stopEngines(){
  moveRobotTwo(STOP,0,0,leftMotor,rightMotor);
}

void checkRobotState(RobotData& robot,HardwareSerial &serial){
  readVoltage(previousMillis,robot.batteryVoltage);
  if(robot.batteryVoltage<voltageCutoff){
    sendTurnOffMessage(BatteryError);
    sendLidarCommands(LidarOff,serial);
    stopEngines();
    return;
  }
  if (robot.initializing) {
  sendLidarCommands(LidarOn, serial);
  unsigned long startTime = millis();
  String response = "";
  while ((millis() - startTime) < timeoutMs) {
    if (serial.available()) {
      String temp = serial.readStringUntil(Terminator);
      temp.trim();
      temp+=Terminator;
      if (temp == LidarOn || temp == LidarOff) {
        response = temp;
        break;
      } else {
        Serial.println("Ignored invalid response: " + temp);
      }
    }
    delay(10);
  }
Serial.println(response);
Serial.println("Received from the lidar");
  if (response == LidarOn) {
    robot.initializing = false;
    robot.isStopped = false;
    sendInitializeMessage(false, "");
  } else {
    robot.initializing = false;
    robot.isStopped = false;
    sendLidarCommands(LidarOff, serial);
    sendInitializeMessage(false, InitializeError);
    Serial.println("Error occurred while starting");
  }
  const long currentmillis = millis(); 
  previousMillis=currentmillis;
  return;
}

  if(robot.isStopped ){
    return;
 }

  //Add retry to stop if stop fails
  if(robot.isStopping){
    Serial.println("Stopping");
     sendLidarCommands(LidarOff,serial);
  unsigned long startTime = millis();
  String response = "";
  while ((millis() - startTime) < 1000) {
    if (serial.available()) {
      String temp = serial.readStringUntil(Terminator);
      temp.trim();
      temp+=Terminator;
      if (temp ==LidarOff) {
        response =temp;
        break;
      } else {
        Serial.println("Ignored invalid response: " + temp);
      }
    }
  }
    if(response==LidarOff){
      robot.isStopped=true;
      sendTurnOffMessage("");
      stopEngines();
    }else{
      robot.isStopped=true;
      sendTurnOffMessage(StopError);
      stopEngines();
    }
    previousMillis=0;
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







// send uart commands to the second esp32 after is tested needs to be moved in a separate file
/**
 * @param message the message to controll the lidar with the following format "L:0#" to stop where '#' means the end of the line, and "L:1#" to start
 */
void  sendLidarCommands(String message,HardwareSerial &serial){
 serial.println(message);
}
