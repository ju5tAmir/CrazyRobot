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
LidarState lidarState = LidarState();
void readReceivedMessages(HardwareSerial &serial,LidarState &liadrState);
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
   readReceivedMessages(TransmitSerial,lidarState);
  }
  if(lidarState.lidarReady){
    readLidarData(&lidarState);
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
void readReceivedMessages(HardwareSerial &serial,LidarState &liadrState){
String line = serial.readStringUntil('#');
line.trim();
line+=Terminator;
if(line.startsWith("L")){
 boolean lidarStateOn = readLidarcommand(line);
 if(lidarStateOn){
  boolean isStarted = initializeHardware();  
  Serial.println("Receiver: Initialization completed.");
  String response = isStarted ? LidarOn : LidarOff;
  lidarState.lidarReady=isStarted;
    serial.println(response);
    Serial.println(response);
    serial.println("Response sent");
 }else{
  stopLidar();
    lidarState.lidarReady=false;
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
