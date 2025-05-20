#include "ir.h"
#include <esp32-hal-adc.h>
#include "../models/models.h"



const int threshold=4000;
float smoothedIr = 0;
const float alpha = 0.2;

void checkForNegativeSpace(){
    int newReading = analogRead(irSensorPin);
    smoothedIr = alpha * newReading + (1 - alpha) * smoothedIr;
    // if (value > threshold) {
    //  return true;
    // } else {
    //   return false;
    // }
}

