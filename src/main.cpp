#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <fns.h>
#include <dotenv.h>

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


void setup() {
    Serial.begin(115200);
    setupMotors();
    connectWiFi();
    connectMQTT();
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
        Serial.print((char)payload[i]);
        response += (char)payload[i];
    }
    Serial.println(response);
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
   value.toLowerCase();
   Serial.println(value);

    if (value == "w") {
        moveRobot(FORWARD,20);
        return;
    }

    if(value=="a"){
      moveRobot(LEFT,20);
      return;
    }

    if(value=="d"){
      moveRobot(RIGHT,20);
      return;
    }

    if(value=="s"){
      moveRobot(STOP,0);
      return;
    }


}



