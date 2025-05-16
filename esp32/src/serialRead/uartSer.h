#include <HardwareSerial.h>
#define MAX_WARNING_LEN 32

#ifndef UARTSER_h
#define UARTSER_h
#define RPLIDAR_RX 16
#define RPLIDAR_TX 17  
extern char serialBuffer[MAX_WARNING_LEN];
extern int serialPos;
void handleWarningChange(HardwareSerial &serial);

#endif
