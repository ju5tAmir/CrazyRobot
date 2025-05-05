#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <esp32-hal-gpio.h>
#include "../lidar/lidar.h"



#ifndef MQTT_h
#define MQTT_h
#define buzzer 13
extern const char* engineManagementUserTopic;
extern const char* driveTopic;
extern const char* commanduser;
extern const char* engineManagementTopic ;
extern const char* distanceWarningTopic; 
extern unsigned long buzzerStartTime;
extern bool buzzerActive;
extern const unsigned long buzzerDuration;


void receiveData(String,RobotData* data);
void connectWiFi();
void connectMQTT(RobotData* robotData);
void sendDistanceWarning(String level,String direction);
void callback(const char* topic, byte* payload, unsigned int length, RobotData* robotData);
void sendInitializeMessage(bool initialized, String error);
void sendTurnOffMessage(String error);
void startBuzzer();
//void callback(const char* topic, byte* payload, unsigned int length);
//void connectMQTT();
#endif
