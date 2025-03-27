#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <dotenv.h>
#include <ArduinoJson.h>
#include <enums.h>
#include <motor.h>
#include "fns.h"

WiFiClient espClient;
PubSubClient client(espClient);
const String topic= "drive";

Motor leftMotor(IN1, IN2, ENA, pwmChannel1); 
Motor rightMotor(IN3, IN4, ENB, pwmChannel2);

// put function declarations here:
void startMotor(int, int);
void receiveData(String);
void connectWiFi();
void callback(const char* topic, byte* payload, unsigned int length);
void connectMQTT();
void blinkLeds(int first,int second,int third,int fourth);
void setupMotors();
bool engineManager(int engineStatus);
void movementManager(int isMoving, String value, int speed);

struct ParsedData {
    bool engine;
    bool isMoving;
    const char* moveValue;
    bool isTurning;
    const char* directionValue;
    int speed;
};

// Json example
String getJsonString() {
    return R"({"engine":true,"move":{"isMoving":true,"value":"w"},"direction":{"isTurning":false,"value":"None"},"speed":50})";
}

ParsedData parseJson(String jsonString) {
    JsonDocument doc = DynamicJsonDocument(512); // Adjust size if needed

    DeserializationError error = deserializeJson(doc, jsonString);

    if (error) {
        Serial.print("Deserialization failed: ");
        Serial.println(error.f_str());
        // Return default values if parsing fails
        return ParsedData();
    }

    // Extract values and return them in a struct
    ParsedData data;
    data.engine = doc["engine"];
    data.isMoving = doc["move"]["isMoving"];
    data.moveValue = doc["move"]["value"];
    data.isTurning = doc["direction"]["isTurning"];
    data.directionValue = doc["direction"]["value"];
    data.speed = doc["speed"];

    return data;
}


void setup() {
    Serial.begin(115200);
//    setupMotors();
//     connectWiFi();
//    connectMQTT();
  

  
}


void loop() {
    if(WiFi.status()!=WL_CONNECTED){
        connectWiFi();
    }
    if(!client.connected()){
        connectMQTT();
    }
    client.loop();   
    delay(2000);
    float scale = 66 / 377;
    moveRobotTwo(FORWARD,255,255, leftMotor,rightMotor);
    delay(3000);
    // moveRobotTwo(FORWARD,200,255, leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,205, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,210, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,215, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,220, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,225, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,230, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,235, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(FORWARD,240, 255,leftMotor,rightMotor);
    // delay(3000);
    // moveRobotTwo(LEFT, 150, 150,leftMotor,rightMotor);
    // delay(3000);
    
  // moveRobot(RIGHT, 150, 150);
    moveRobotTwo(RIGHT, 150, 150,leftMotor,rightMotor);
    delay(1000);
  //  moveRobot(STOP, 0, 0);
    moveRobotTwo(STOP, 0, 0,leftMotor,rightMotor);
    delay(2000);
}



void callback(const char* topic, byte* payload, unsigned int length) {
      Serial.print("Message arrived on topic: ");
      Serial.println(topic);
      String response = "";
      for (int i = 0; i < length; i++) {
        response += (char)payload[i];
    }
    Serial.println(response);
    receiveData(response);
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



void connectMQTT() {
  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setCallback(callback);
  digitalWrite(LED_BUILTIN,HIGH);
  int attempts = 0;
  while (!client.connected() && attempts < 5) {
      digitalWrite(LED_BUILTIN,HIGH);
     Serial.println("Connecting to MQTT...");
      if (client.connect("ESP32Client", MQTT_TOKEN, "")) {
          Serial.println("Connected to MQTT");
          client.subscribe("drive");
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
}


void receiveData(String value){
    // Get parsed values
    ParsedData data = parseJson(value);

    // Checks if engine is ON or OFF
    if (!engineManager(data.engine)) {
        return;
    };

    // Checks for movements
    movementManager(data.isMoving, data.moveValue, data.speed);
   //  Serial.print("Is Moving: ");
   //  Serial.println(data.isMoving);
   //  Serial.print("Move Value: ");
   //  Serial.println(data.moveValue);
   //  Serial.print("Is Turning: ");
   //  Serial.println(data.isTurning);
   //  Serial.print("Direction Value: ");
   //  Serial.println(data.directionValue);
   //  Serial.print("Speed: ");
   //  Serial.println(data.speed);
}


bool engineManager(int engineStatus) {
    if (engineStatus == 0) {
      //  engineSwitch(EngineStatus::OFF);
      moveRobot(Direction::STOP,0);
      return false;
    };

    return true;
}


void movementManager(int isMoving, String value, int speed) {
    if (isMoving == 0) {
        return;
    };

    if (value.charAt(0) == 'w') {
            moveRobot(Direction::FORWARD, speed);
    };
    if(value.charAt(0)== 's'){
        moveRobot(Direction::BACKWARD, speed);
    }
}


