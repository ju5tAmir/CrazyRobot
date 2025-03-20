#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <fns.h>






WiFiClient espClient;
PubSubClient client(espClient);
const String topic= "drive";

const char* ssid = "AndreiIo";
const char* password = "Lexmarkt650h";
const char* host= "mqtt.flespi.io";
const int port =1883;
const char* token= "FlespiToken FMNd4DVTUMt7Avhzya0pqOFeayWoLtcCqgpIpGGbSiVGo7yLVhsmYU1N4H8r1h2F";
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
  Serial.begin(115200);
  delay(3000);  // Give ESP32 time to boot
  Serial.println("Booting...");

  setupMotors();

  Serial.println("Testing Motor A Forward...");
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  ledcWrite(pwmChannel1, 255);  // Test speed (0-255)

  delay(3000);

  Serial.println("Testing Motor B Forward...");
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  ledcWrite(pwmChannel2, 255);  // Test speed

  delay(3000);
  
  Serial.println("Stopping Motors...");
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  ledcWrite(pwmChannel1, 0);
  ledcWrite(pwmChannel2, 0);

// if(WiFi.status()!=WL_CONNECTED){
//   connectWiFi();
//  }
// if(!client.connected()){
//   connectMQTT();
// }
// client.loop();

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
  receiveData(response);

  // String response = "";

  // for (int i = 0; i < length; i++) {
  //     Serial.print((char)payload[i]);
  //     response += (char)payload[i];
  // }
  // Serial.println(); 

  // Serial.print("Parsed Response: ");
  // Serial.println(response);

  // int valueIndex = response.indexOf("\"value\":\"");
  // if (valueIndex != -1) {
  //     valueIndex += 9; 
  //     int valueEndIndex = response.indexOf("\"", valueIndex);
  //     if (valueEndIndex != -1) {
  //         String value = response.substring(valueIndex, valueEndIndex);
  //         Serial.print("Extracted Value: ");
  //         Serial.println(value);
  //         receiveData(value);
  //     } else {
  //         Serial.println(" Error: Could not find end of value.");
  //     }
  // } else {
  //     Serial.println("Error: 'value' key not found in response.");
  // }
}





void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("\nConnecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
      digitalWrite(LED_BUILTIN, HIGH);
      delay(50);
      digitalWrite(LED_BUILTIN, LOW);
      delay(50);
  }

  // digitalWrite(LEDW, HIGH);
  Serial.println("\nConnected to WiFi");
  Serial.print("Local ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  client.setServer(host, port);
  client.setCallback(callback);

  int attempts = 0;
  while (!client.connected() && attempts < 5) { // Limit to 5 attempts
      Serial.println("Connecting to MQTT...");
      if (client.connect("ESP32Client", token, "")) {
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



// if(value=="0" || value=="1"){
// digitalWrite(LEDY,HIGH);
// buttonPressed=0;
// delay(500);
// digitalWrite(LEDY,LOW);
// }
//  if(value=="2" || value=="3"){
// digitalWrite(LEDG,HIGH);
// delay(500);
// digitalWrite(LEDG,LOW);
// buttonPressed=1;



