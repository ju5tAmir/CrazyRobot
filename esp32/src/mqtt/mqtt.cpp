#include <Arduino.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <dotenv.h>
#include <PubSubClient.h>
#include "mqtt.h"
#include <ArduinoJson.h>
#include <esp32-hal-gpio.h>

#include "mqtt.h"

WiFiClient espClient;
PubSubClient client(espClient);

const char* engineManagementUserTopic = "engineManagementUser";
const char* driveTopic = "drive";

unsigned long buzzerStartTime = 0;
bool buzzerActive = false;
const unsigned long buzzerDuration = 100; 



void callback(const char* topic, byte* payload, unsigned int length,RobotData* robotData) {
      Serial.print("Message arrived on topic: ");
      Serial.println(topic);
      String response = "";
      for (int i = 0; i < length; i++) {
        response += (char)payload[i];
    }
    Serial.println(response);
    receiveData(response,robotData);
}


void connectWiFi() {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(50);
    WiFi.mode(WIFI_STA);    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.println("Connecting to SSID:");
    Serial.println(WIFI_SSID);
    Serial.println("With password:");
    Serial.println(WIFI_PASSWORD);

    int retryCount = 0;
    while (WiFi.status() != WL_CONNECTED && retryCount < 30) {
        Serial.print(".");
        digitalWrite(LED_BUILTIN, HIGH);
        delay(250);
        digitalWrite(LED_BUILTIN, LOW);
        delay(250);
        retryCount++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" Connected to WiFi!");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println(" Failed to connect to WiFi.");
    }
}
 void connectMQTT(RobotData* robotData){
    client.setServer(MQTT_HOST, MQTT_PORT);
    client.setCallback([robotData](char* topic, byte* payload, unsigned int length) {
        callback(topic, payload, length, robotData);
    });
  digitalWrite(LED_BUILTIN,HIGH);
  int attempts = 0;
  while (!client.connected() && attempts < 5) {
      digitalWrite(LED_BUILTIN,HIGH);
     Serial.println("Connecting to MQTT...");
      if (client.connect("ESP32Client", MQTT_TOKEN, "")) {
          Serial.println("Connected to MQTT");
          client.subscribe(engineManagementUserTopic);
          return;
      } else {
          Serial.print("MQTT connection failed. State: ");
          Serial.println(client.state());
          attempts++;
          delay(2000);
      }
  }

  if (!client.connected()) {
      Serial.println("Failed to connect to MQTT after multiple attempts, rebooting...");
      ESP.restart(); 
  } 
 };
// void connectMQTT() {
//   client.setServer(MQTT_HOST, MQTT_PORT);
//   client.setCallback(callback);
//   digitalWrite(LED_BUILTIN,HIGH);
//   int attempts = 0;
//   while (!client.connected() && attempts < 5) {
//       digitalWrite(LED_BUILTIN,HIGH);
//      Serial.println("Connecting to MQTT...");
//       if (client.connect("ESP32Client", MQTT_TOKEN, "")) {
//           Serial.println("Connected to MQTT");
//           client.subscribe(engineManagementUserTopic);
//           return;
//       } else {
//           Serial.print("MQTT connection failed. State: ");
//           Serial.println(client.state());
//           attempts++;
//           delay(2000);
//       }
//   }

//   if (!client.connected()) {
//       Serial.println("Failed to connect to MQTT after multiple attempts, rebooting...");
//       ESP.restart(); 
//   }
// }

RobotData parseJson(String jsonString) {
    DynamicJsonDocument doc(512); // Correct declaration

    DeserializationError error = deserializeJson(doc, jsonString);

    if (error) {
        Serial.print("Deserialization failed: ");
        Serial.println(error.f_str());
        return RobotData(); 
    }

    RobotData data;

    if (doc.containsKey("CommandType") && doc["CommandType"] == "Initialize") {
        startBuzzer(); 

        if (doc.containsKey("Payload")) {
            JsonObject payload = doc["Payload"]; // Access the Payload object
            
            if (payload.containsKey("Engine")) {
                data.Engine = payload["Engine"];
            }

            if (payload.containsKey("move") && payload["move"].containsKey("isMoving")) {
                data.isMoving = payload["move"]["isMoving"];
            }
        }
    }

    return data;
}

void receiveData(String value ,RobotData * robotData){
    // Get parsed values
    RobotData data = parseJson(value);
    Serial.print("Engine: ");
    Serial.println(data.Engine);
    Serial.print("IsMoving: ");
    Serial.println(data.isMoving);

    robotData->Engine=data.Engine;
    robotData->isMoving=data.isMoving;
 
}

void startBuzzer() {
    digitalWrite(buzzer, HIGH);   // Start buzzing
    buzzerStartTime = millis();      // Save the current time
    buzzerActive = true;             // Now it's active
    Serial.println("Buzzer ON");
}

