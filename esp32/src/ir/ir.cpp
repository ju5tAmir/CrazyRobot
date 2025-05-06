#include "ir.h"
#include <esp32-hal-adc.h>



const int threshold=1500;

bool checkForNegativeSpace(){
    int value = analogRead(irSensorPin);
    if (value > threshold) {
     return true;
    } else {
      return false;
    }
}

