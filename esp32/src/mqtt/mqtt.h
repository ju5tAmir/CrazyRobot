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
extern const char* commanduser;
extern const char* engineManagementTopic ;
extern unsigned long buzzerStartTime;
extern bool buzzerActive;
extern const unsigned long buzzerDuration;
struct RobotData {
    bool isMoving=false;
    bool initializing = false;
    bool isStopping = false;
    const char* activeMovements[4]={ nullptr, nullptr, nullptr, nullptr };  
    bool isStopped = true;
    bool lidarReady = false;
    // const char* moveValue;
    // bool isTurning;
    // const char* directionValue;
    // int speed;
};

struct Publisher{
    PubSubClient client ;
    void publish(const char* topic, const char* payload) {
         client.publish(topic, payload);
      }
};

void receiveData(String,RobotData* data);
void connectWiFi();
void connectMQTT(RobotData* robotData);
void callback(const char* topic, byte* payload, unsigned int length, RobotData* robotData);
void sendInitializeMessage(bool initialized, String error);
void sendTurnOffMessage(String error);
void startBuzzer();
//void callback(const char* topic, byte* payload, unsigned int length);
//void connectMQTT();
#endif
