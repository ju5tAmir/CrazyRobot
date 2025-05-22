#include "battery.h"
#include "../mqtt/mqtt.h"




const float voltageCutoff = 10.0;


unsigned long previousMillis = 0;
const unsigned long sampleInterval = 10000;
INA226 INA(0x40);
void setBatteryMeter()
{
  Wire.begin();
  if (!INA.begin() )
  {
    Serial.println("could not connect. Fix and Reboot");
  }
  INA.setMaxCurrentShunt(6, 0.1);
}

void readVoltage(unsigned long &previousMillis,float &currentVoltage)
{
    if(millis()-previousMillis>=sampleInterval){
          previousMillis = millis();
          float measureVoltage = INA.getBusVoltage();
        currentVoltage=measureVoltage;
        sendBatteryInfo(measureVoltage);
    }
}
