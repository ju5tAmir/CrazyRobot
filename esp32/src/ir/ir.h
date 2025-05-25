#ifndef IR_h
#define IR_h
#define irSensorPin 36
#include "../models/models.h"

extern const int threshold;
extern float smoothedIr;
extern const float alpha ;
void checkForNegativeSpace();
void negativeSpaceDetection(RobotData &robot);
extern unsigned long startedMesurement;
extern const unsigned long negativeHoldDelay ;
extern const unsigned long holdDelay;
#endif
