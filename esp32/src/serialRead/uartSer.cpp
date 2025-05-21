
#include "uartSer.h"
#include "../mqtt/mqtt.h"
#include  "../models/models.h"
#include "../obstacles/obstacles.h"
#include "../models/models.h"
#include  "../messages/messages.h"




int serialPos=0;
char serialBuffer[MAX_WARNING_LEN]="";


bool readSerialMessage(HardwareSerial &serial, String &outMessage) {
  static String buffer = "";
  while (serial.available()) {
    char c = serial.read();
    if (isPrintable(c)) {
      buffer += c;
    }
    if (c == Terminator) {
      outMessage = buffer;
      buffer = "";
      return true;
    }
  }
  return false;
}




// void handleWarningChange(HardwareSerial &serial,RobotData &robotState) {
//   while (serial.available()) {
//     char c = serial.read();
//     // if in the serial buffer are messages to start or stop the lidar, do not read them 
//     if(c=='L'){
//       return;
//     }
//     if (c == Terminator) {
//       serialBuffer[serialPos] = '\0';  

//       String message = String(serialBuffer)+=Terminator;
//       robotState.lidarWarnings=message;
//       sendDistanceWarningNew(message);
//       serialPos = 0;
//     }
//     else if (serialPos < MAX_WARNING_LEN - 1 && isPrintable(c)) {
//       serialBuffer[serialPos++] = c;
//     }

//     else {
//       serialPos = 0;  
//     }
//   }
// }




