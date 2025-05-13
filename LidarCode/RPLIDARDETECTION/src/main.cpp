#include <Arduino.h>
#define RX 25
#define RT 26
#define led 2
#include "LIDAR/lidar.h"
#include "models/models.h"
#include "commands/commands.h"

//serial to communicate with the motor controll microcontroller
HardwareSerial TransmitSerial(1);

// put function declarations here:
int myFunction(int, int);
RobotData robot = RobotData();
void readReceivedMessages(HardwareSerial &serial);
boolean readLidarcommand(String message);

void setup() {
   Serial.begin(115200);
  // put your setup code here, to run once:
     TransmitSerial.begin(115200, SERIAL_8N1, RX, RT);
     pinMode(led,OUTPUT);
// initializeHardware();
}

void loop() {
  if(TransmitSerial.available()){
   readReceivedMessages(TransmitSerial);
  }
  
  // readLidarData(&robot);
//  int result = myFunction(2, 3);
//   digitalWrite(led,HIGH);
//   LidarSerial.println("beginesp:" +String(result));
//   Serial.println(String(result));
//   delay(2000);
//    digitalWrite(led,LOW);
//     delay(2000);
  // put your main code here, to run repeatedly:
}

// put function definitions here:
int myFunction(int x, int y) {
  return x + y;
}


// this method can be improved to handle the state when lidar could not be turned off 
void readReceivedMessages(HardwareSerial &serial){
String line = serial.readStringUntil('#');
line.trim();
if(line.startsWith("L")){
 boolean lidarStateOn = readLidarcommand(line);
 if(lidarStateOn){
  boolean isStarted = initializeHardware();  
  Serial.println("Receiver: Initialization completed.");
  String response = isStarted ? LidarOn : LidarOff;
 }else{
  stopLidar();
   serial.println(LidarOff);
 }
}
}


//read start stopCommand for the lidar 
boolean readLidarcommand(String message) {
  int delimiter = message.indexOf(":");
  if (delimiter != -1 && delimiter < message.length() - 1) {
    String command = message.substring(delimiter + 1);
    if (command == "0") {
      return false;
    } else if (command == "1") {
      return true;
    }
  }
  Serial.println("Invalid LIDAR message: " + message);
  return false;
}
