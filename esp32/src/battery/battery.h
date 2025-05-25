#ifndef BATTERY_h
#define BATTERY_h
#include "INA226.h"


extern  INA226 INA;
extern unsigned long previousMillis;
extern const unsigned long sampleInterval; 
void setBatteryMeter();
void readVoltage(unsigned long  &previousMillis,float &currentVoltage);
float readVoltageLive();
#endif
