#include "ir.h"
#include <esp32-hal-adc.h>
#include "../models/models.h"



const int threshold=1500;

bool checkForNegativeSpace(RobotData & robot){
    int value = analogRead(irSensorPin);
    if (value > threshold) {
     return true;
    } else {
      return false;
    }
}

