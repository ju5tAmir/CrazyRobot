#include "ir.h"
#include <esp32-hal-adc.h>
#include "../models/models.h"



const int threshold=4000;
float smoothedIr = 0;
const float alpha = 0.2;
unsigned long startedMesurement=0;
const unsigned long negativeHoldDelay = 500;
const unsigned long holdDelay = 1000;

void checkForNegativeSpace(){
    int newReading = analogRead(irSensorPin);
    smoothedIr = alpha * newReading + (1 - alpha) * smoothedIr;
}

