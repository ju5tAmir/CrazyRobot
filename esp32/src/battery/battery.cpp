#include "battery.h"
#include "../mqtt/mqtt.h"

unsigned long previousMillis = 0;
const unsigned long sampleInterval = 10000;
INA226 INA(0x40);
void setBatteryMeter()
{
  Wire.begin(21,22);
  if (!INA.begin() )
  {
    Serial.println("could not connect. Fix and Reboot");
  }
  INA.setMaxCurrentShunt(6, 0.1); Serial.println("I2C Scanner...");
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("I2C device found at 0x");
      Serial.println(address, HEX);
    }
  }
}

void readVoltage(unsigned long &previousMillis,float &currentVoltage)
{
    if(millis()-previousMillis>=sampleInterval){
          previousMillis = millis();
          float measureVoltage = INA.getBusVoltage();
          float measureC = INA.getCurrent();
          Serial.println(measureC);
          Serial.println(measureVoltage);
        currentVoltage=measureVoltage;
        sendBatteryInfo(measureVoltage);
    }
}


float readVoltageLive(){
   float measureVoltage = INA.getBusVoltage();
     return measureVoltage;
}
