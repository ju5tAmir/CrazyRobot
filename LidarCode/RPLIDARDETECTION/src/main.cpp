#include <Arduino.h>
#define RX 25
#define RTT 26
#define led 2
#include "LIDAR/lidar.h"
#include "models/models.h"
#include "commands/commands.h"
#include "LIDAR/zoneDetection.h"
#define MAX_CMD_LEN 32

//serial to communicate with the motor controll microcontroller
HardwareSerial TransmitSerial(1);
unsigned long lastChecked = 0;
unsigned long lidarChecktimer = 200;
LidarState lidarState = LidarState();
void processLidarCommand(const String &msg, LidarState &lidarState);
void handleSerialCommands(HardwareSerial &serial, LidarState &lidarState);


char serialBuffer[MAX_CMD_LEN];
int serialPos = 0;

void setup() {
   Serial.begin(115200);
   TransmitSerial.begin(115200, SERIAL_8N1, RX, RTT);
    while (TransmitSerial.available()) TransmitSerial.read();
   Serial.println("System initialized and ready");
}

void loop() {
  // Process any incoming commands
handleSerialCommands(TransmitSerial,lidarState);

  // Only process LIDAR data if it's ready
  if(lidarState.lidarReady) {
    // Read data from the LIDAR sensor
    readLidarData(&lidarState);
    
    // Process a full scan when it's complete
    if(lidarState.fullScanForProcessing) {
      // Switch buffer indexes to avoid data corruption
      int readIndex = lidarState.activeBufferIndex;
      lidarState.activeBufferIndex = 1 - lidarState.activeBufferIndex; 
    
      // Get the ready-to-read buffer
      Obstacle* readBuffer = lidarState.obstacleBuffers[readIndex];
      int count = lidarState.obstacleCounts[readIndex];
    
      // Update obstacle warnings using the TransmitSerial (not LidarSerial)
      updateObstaclesPerRegion(readBuffer, count, TransmitSerial);
      
      // Reset the flag to allow for next scan
      lidarState.fullScanForProcessing = false;
      
      // Debug output
      Serial.print("Processed scan with ");
      Serial.print(count);
      Serial.println(" obstacles");
    }   
  }

  delay(5);
}


void processLidarCommand(const String &msg, LidarState &lidarState) {
  Serial.println("Received LIDAR message: " + msg);
  if (msg == LidarOn) {
    bool started = initializeHardware(lidarState);
    lidarState.lidarReady = started;
    TransmitSerial.println(started ? LidarOn : LidarOff);
    Serial.println(started ? "LIDAR started." : "Failed to start LIDAR.");
  } else if (msg == LidarOff) {
    stopLidar(lidarState);
    lidarState.lidarReady = false;
    TransmitSerial.println(LidarOff);
    Serial.println("LIDAR stopped.");
  } else {
    Serial.println("Invalid command: " + msg);
  }
}

void handleSerialCommands(HardwareSerial &serial, LidarState &lidarState) {
  while (serial.available()) {
    char c = serial.read();
    if (c == Terminator) {
      serialBuffer[serialPos] = '\0';  // Terminate string
      String message = String(serialBuffer)+=Terminator;
      processLidarCommand(message, lidarState);
      serialPos = 0;
    }
    // Normal character
    else if (serialPos < MAX_CMD_LEN - 1 && isPrintable(c)) {
      serialBuffer[serialPos++] = c;
    }

    else {
      serialPos = 0;  
    }
  }
}
