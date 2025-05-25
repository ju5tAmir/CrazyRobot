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
#include "battery/battery.h"
#include "servo/ServoManager.h"


// Create servo manager instance - automatically loads all servo configurations
// ServoManager servoManager;

Motor rightMotor(IN1, IN2, ENA, pwmChannel1);
Motor leftMotor(IN4, IN3, ENB, pwmChannel2);
ServoEasing myServo;
RobotData robot = RobotData();
HardwareSerial LidarSerial(2);
MessageQueue lidarResponseQueue = MessageQueue();
void actOnMovements();
void checkRobotState(RobotData &robot, HardwareSerial &serial);
void initializeRobot(RobotData &robot, HardwareSerial &serial, bool &retFlag);
void shutDownRobot(RobotData &robot, HardwareSerial &serial, bool &retFlag);
void stopEngines();
void negativeSpaceDetection(RobotData &robot);
void  sendLidarCommands(String message,HardwareSerial &serial);




//Timing for the ir sensor
unsigned long lastDangerTime = 0;
unsigned long lastLidarMesurement =0; 

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
 
  if(robot.batteryVoltage<=robot.voltageCutOff&&!robot.emptyBattery){
    robot.emptyBattery=true;
    sendBatteryInfo(0.00);
    sendLidarCommands(LidarOff,serial);
    robot.isStopped=true;
    robot.initializing=false;
    stopEngines();
    return;
  }

   if(robot.batteryVoltage>robot.voltageCutOff && robot.emptyBattery ){
          robot.emptyBattery=false;
   }

   //initialize robot
  bool initializeFlag;
  initializeRobot(robot, serial, initializeFlag);
  if (initializeFlag)
    return;

     bool shutDownFlag;
 shutDownRobot(robot, serial, shutDownFlag);
 if (shutDownFlag)
   return;

  if(robot.isStopped ){
    return;
 }
 

 //shut down robot



 // check for negative space an act accordingly, removing the front movement command from allowed movements
 negativeSpaceDetection(robot);
 // move robot bassed on the received commands
 actOnMovements();
 // read the battery status
 readVoltage(previousMillis, robot.batteryVoltage);
}


// initialize robot and lidar 
void initializeRobot(RobotData &robot, HardwareSerial &serial, bool &retFlag)
{
  retFlag = true;
 
  
  if (robot.initializing)
  {
       float currentvoltage = readVoltageLive();
  if(currentvoltage<robot.voltageCutOff){
      sendInitializeMessage(true, BatteryLevelLow);
      robot.initializing = false;
      robot.isStopped=true;
      robot.emptyBattery = true;
  return;
  }

    sendLidarCommands(LidarOn, serial);
    unsigned long startTime = millis();
    String response = "";
    while ((millis() - startTime) < timeoutMs)
    {
      if (serial.available())
      {
        String temp = serial.readStringUntil(Terminator);
        temp.trim();
        temp += Terminator;
        if (temp == LidarOn || temp == LidarOff)
        {
          response = temp;
          break;
        }
        else
        {
          Serial.println("Ignored invalid response: " + temp);
        }
      }
      delay(10);
    }
    Serial.println(response);
    Serial.println("Received from the lidar");
    if (response == LidarOn)
    {
      robot.initializing = false;
      robot.isStopped = false;
      sendInitializeMessage(false, "");
    }
    else
    {
      robot.initializing = false;
      robot.isStopped = false;
      sendLidarCommands(LidarOff, serial);
      sendInitializeMessage(false, InitializeError);
      Serial.println("Error occurred while starting");
    }
    previousMillis = millis();
    return;
  }
  retFlag = false;
}

// shut down the robot if the stop command is sent trough mqtt, and shut down the lidar also
void shutDownRobot(RobotData &robot, HardwareSerial &serial, bool &retFlag)
{
  retFlag = true;
  if (robot.isStopping)
  {
    Serial.println("Stopping");
    sendLidarCommands(LidarOff, serial);
    unsigned long startTime = millis();
    String response = "";
    while ((millis() - startTime) < 1000)
    {
      if (serial.available())
      {
        String temp = serial.readStringUntil(Terminator);
        temp.trim();
        temp += Terminator;
        if (temp == LidarOff)
        {
          response = temp;
          break;
        }
        else
        {
          Serial.println("Ignored invalid response: " + temp);
        }
      }
    }
    if (response == LidarOff)
    {
      robot.isStopped = true;
      sendTurnOffMessage("");
      stopEngines();
    }
    else
    {
      robot.isStopped = true;
      sendTurnOffMessage(StopError);
      stopEngines();
    }
    previousMillis = 0;
    return;
  }
  retFlag = false;
}



// check for a negative space, remove the front movement, and send warning messages to the client 
void negativeSpaceDetection(RobotData &robot)
{

  checkForNegativeSpace();

  if (smoothedIr >= threshold)
  {

    if (!isMovementAllowed(robot.activeMovements, 'w', 4))
    {
      return;
    }
    if (startedMesurement == 0)
    {
      startedMesurement = millis();
    }
    if (!robot.negativeDanger && millis() - startedMesurement >= negativeHoldDelay)
    {
      lastDangerTime = millis();
      removeAllowedMovement(robot.allowedMovements, 'w');
      sendNegativeWarning(SEVERE);
      robot.negativeDanger = true;
    }
  }
  else
  {
    if (robot.negativeDanger && millis() - lastDangerTime >= holdDelay)
    {
      startedMesurement = 0;
      addAllowedMovement(robot.allowedMovements, 'w');
      sendNegativeWarning(FREE);
      robot.negativeDanger = false;
    }
  }
}

// send uart commands to the second esp32 after is tested needs to be moved in a separate file
/**
 * @param message the message to controll the lidar with the following format "L:0#" to stop where '#' means the end of the line, and "L:1#" to start
 */
void  sendLidarCommands(String message,HardwareSerial &serial){
 serial.println(message);
}
