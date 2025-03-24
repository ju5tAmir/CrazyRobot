#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <dotenv.h>
#include <ArduinoJson.h>
#include <enums.h>
#include <motor.h>

WiFiClient espClient;
PubSubClient client(espClient);
const String topic= "drive";


// put function declarations here:
int myFunction(int, int);
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
    DynamicJsonDocument doc(512); // Adjust size if needed

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
    setupMotors();
    connectWiFi();
    connectMQTT();
    // client.loop();
}


void loop() {
    if(WiFi.status()!=WL_CONNECTED){
        connectWiFi();
    }
    if(!client.connected()){
        connectMQTT();
    }
    client.loop();
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
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.println("\nConnecting to WiFi...");

    while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
      digitalWrite(LED_BUILTIN, HIGH);
      delay(50);
      digitalWrite(LED_BUILTIN, LOW);
      delay(50);
    }
}


void connectMQTT() {
  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setCallback(callback);

  int attempts = 0;
  while (!client.connected() && attempts < 5) { // Limit to 5 attempts
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
      ESP.restart();  // Reboot ESP32 if connection fails
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
        engineSwitch(EngineStatus::OFF);
        return false;
    };

    engineSwitch(EngineStatus::ON);
    return true;
}


void movementManager(int isMoving, String value, int speed) {
    if (isMoving == 0) {
        return;
    };

    if (value.charAt(0) == 'w') {
            moveRobot(Move::FORWARD, speed);
    };
}


