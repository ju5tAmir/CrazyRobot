
#include "uartSer.h"
#include "../mqtt/mqtt.h"
#include  "../messages/messages.h"

int serialPos=0;
char serialBuffer[MAX_WARNING_LEN]="";
void handleWarningChange(HardwareSerial &serial) {
  while (serial.available()) {
    char c = serial.read();
    if (c == Terminator) {
      serialBuffer[serialPos] = '\0';  
      String message = String(serialBuffer)+=Terminator;
      sendDistanceWarningNew(message);
      serialPos = 0;
    }
    else if (serialPos < MAX_WARNING_LEN - 1 && isPrintable(c)) {
      serialBuffer[serialPos++] = c;
    }

    else {
      serialPos = 0;  
    }
  }
}
