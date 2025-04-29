#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <esp32-hal-gpio.h>

#ifndef MQTT_h
#define MQTT_h
#define buzzer 13

extern WiFiClient espClient;
extern PubSubClient client;

extern const char* engineManagementUserTopic;
extern const char* driveTopic;

extern unsigned long buzzerStartTime;
extern bool buzzerActive;
extern const unsigned long buzzerDuration;
struct RobotData {
    bool Engine=false;
    bool isMoving=false;
    // const char* moveValue;
    // bool isTurning;
    // const char* directionValue;
    // int speed;
};

void receiveData(String,RobotData* data);
void connectWiFi();
void connectMQTT(RobotData* robotData);
void callback(const char* topic, byte* payload, unsigned int length, RobotData* robotData);
void startBuzzer();
//void callback(const char* topic, byte* payload, unsigned int length);
//void connectMQTT();
#endif
