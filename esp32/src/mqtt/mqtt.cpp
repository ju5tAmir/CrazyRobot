#include <Arduino.h>
#include <HardwareSerial.h>
#include <dotenv.h>
#include "mqtt.h"
#include <ArduinoJson.h>
#include <esp32-hal-gpio.h>
#include "models/models.h"

WiFiClient espClient;
PubSubClient client(espClient);
Publisher publisher = Publisher();

const char* engineManagementUserTopic = "engineManagementUser";
const char* commanduser = "commandsuser";
const char* driveTopic = "drive";
const char* engineManagementTopic = "engineManagementEsp";
const char* distanceWarningTopic = "distanceWarningTopic";
const char* negativeDistanceWarningTopic = "negativeDistanceWarningTopic";




//solve the arriving message trough mqtt
void callback(const char* topic, byte* payload, unsigned int length,RobotData* robotData) {

      String response = "";
      for (int i = 0; i < length; i++) {
        response += (char)payload[i];
    }

    receiveData(response,robotData);
}

//connect to wifi
void connectWiFi() {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(50);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int retryCount = 0;
    while (WiFi.status() != WL_CONNECTED && retryCount < 30) {
        retryCount++;
    }

    // if (WiFi.status() == WL_CONNECTED) {
    //     Serial.println(" Connected to WiFi!");
    //     Serial.println(WiFi.localIP());
    // } else {
    //     Serial.println(" Failed to connect to WiFi.");
    // }
}


//Method to connect to the mqtt broker
 void connectMQTT(RobotData* robotData){

    client.setServer(MQTT_HOST, MQTT_PORT);
    client.setCallback([robotData](char* topic, byte* payload, unsigned int length) {
        callback(topic, payload, length, robotData);
    });
  digitalWrite(LED_BUILTIN,HIGH);
  int attempts = 0;
  while (!client.connected() && attempts < 5) {
     // digitalWrite(LED_BUILTIN,HIGH);
    //  Serial.println("Connecting to MQTT...");
      if (client.connect("ESP32Client", MQTT_TOKEN, "")) {
        //   Serial.println("Connected to MQTT");
          client.subscribe(engineManagementUserTopic);
          client.subscribe(commanduser);
          publisher.client=client;
          return;
      } else {
        //   Serial.print("MQTT connection failed. State: ");
        //   Serial.println(client.state());
          attempts++;
          delay(2000);
      }
  }

  if (!client.connected()) {
    //   Serial.println("Failed to connect to MQTT after multiple attempts, rebooting...");
      ESP.restart();
  }
 };


//parse message into rbot struct that will be used to controll the robot
RobotData parseJson(String jsonString) {
    DynamicJsonDocument doc(512);

    DeserializationError error = deserializeJson(doc, jsonString);

    if (error) {
        // Serial.print("Deserialization failed: ");
        // Serial.println(error.f_str());
        return RobotData();
    }

    RobotData data;

    if(doc.containsKey("CommandType")){
        if(doc["CommandType"] == "Initialize"){
            if (doc.containsKey("Payload")) {
                JsonObject payload = doc["Payload"];
                if (payload.containsKey("Engine")) {
                    bool startInitialize = payload["Engine"];
                    if(startInitialize){
                        data.initializing= true;
                    }else{
                        data.isStopping= true;
                    }
                }
                if (payload.containsKey("move") && payload["move"].containsKey("isMoving")) {
                    data.isMoving = payload["move"]["isMoving"];
                }
            }
        }
        if (doc.containsKey("Payload")) {
            JsonObject payload = doc["Payload"];
            if (payload.containsKey("Directions")) {
                JsonObject directions = payload["Directions"];
                if (directions.containsKey("ActiveMovements")) {
                    JsonArray movements = directions["ActiveMovements"];
                    int i = 0;

                    for (JsonVariant v : movements) {
                        const char* s = v.as<const char*>();
                        if (i < 4 && s != nullptr && strlen(s) > 0) {
                            data.activeMovements[i++] = s[0];
                        } else {
                            data.activeMovements[i++] = '_';
                        }
                    }
                    while (i < 4) {
                        data.activeMovements[i++] = '_';
                    }
                }
            }
        }

        if (doc.containsKey("Payload")) {
            JsonObject payload = doc["Payload"];
            if (payload.containsKey("Servos")) {
                JsonObject servos = payload["Servos"];
                if (servos.containsKey("Head")) {
                    int headValue = servos["Head"].as<int>();
                    Serial.println(headValue);
                    data.servo.head = headValue;
                }
            }
        }
    }

    return data;
}



//map the temporary object to the one used in the main.cpp
void receiveData(String value ,RobotData * robotData){
    RobotData data = parseJson(value);
    robotData->initializing =data.initializing;
    robotData->isMoving=data.isMoving;
    robotData->isStopping=data.isStopping;
    for (int i = 0; i < 4; i++) {
        robotData->activeMovements[i] = data.activeMovements[i];
    }
    robotData->servo.head=data.servo.head;
}




//send response back to the server recarding intialization process
void sendInitializeMessage(bool initialized, String error){
    DynamicJsonDocument doc(256);
    doc["CommandType"] = "Initialized";
    JsonObject pl = doc.createNestedObject("Payload");
    pl["InitializeEngine"] = initialized;
    pl["ErrorMessage"] = error;
    String out;
    serializeJson(doc, out);
    // Serial.println(out);
    publisher.publish(engineManagementTopic, out.c_str());
    }
//send shut off performed message
void sendTurnOffMessage(String error){
    DynamicJsonDocument doc(256);
    doc["CommandType"] = "Initialized";
    JsonObject pl = doc.createNestedObject("Payload");
    pl["InitializeEngine"] = true;
    pl["ErrorMessage"] = error;
    String out;
    serializeJson(doc, out);
    publisher.publish(engineManagementTopic,out.c_str());
}


//send  distance warning to client
void sendDistanceWarning(String level,String direction){
    DynamicJsonDocument doc(256);
    doc["CommandType"] = "DistanceWarning";
    JsonObject pl = doc.createNestedObject("Payload");
    pl["Warning"] = level;
    pl["Direction"] = direction;
    String out;
    serializeJson(doc, out);
    // Serial.println(out);
    publisher.publish(distanceWarningTopic, out.c_str());
}

//send distance warning to the client new
void sendDistanceWarningNew(String levels){
    DynamicJsonDocument doc(256);
    doc["CommandType"] = "DistanceWarning";
    JsonObject pl = doc.createNestedObject("Payload");
    pl["Warning"] = levels;
    String out;
    serializeJson(doc, out);
    publisher.publish(distanceWarningTopic, out.c_str());
}

// send negative space information

void sendNegativeWarning(String level){
    DynamicJsonDocument doc(256);
    doc["CommandType"] = "NegativeWarning";
    JsonObject pl = doc.createNestedObject("Payload");
    pl["Warning"] = level;
    String out;
    serializeJson(doc, out);
    // Serial.println(out);
    publisher.publish(negativeDistanceWarningTopic, out.c_str());
}
