#include <RPLidar.h>
#include "lidar/lidar.h"
#include "fns.h"

Motor leftMotor(IN1, IN2, ENA, pwmChannel1); 
Motor rightMotor(IN3, IN4, ENB, pwmChannel2);       

void setup() {
initializeHardware();
}

void loop() {
  readLidarData();
}






//here starts the woking byte read
// #include <Arduino.h>
// #include <HardwareSerial.h>
// #include <esp32-hal-ledc.h>

// #define LIDAR_RX 16
// #define LIDAR_TX 17
// #define MotPin 25
// #define yellow 26
// #define red 13
// #define green 14
// #define blue 0

// const int pwmChannel = 0;
// const int pwmFreq = 25000;
// const int pwmResolution = 8;

// HardwareSerial LidarSerial(2);
// unsigned long lastDataTime = 0;
// unsigned long scanRestartInterval = 3000; 
// bool isValidHeader(uint8_t b);
// void parsePacket(uint8_t* data);
// float normalizeAngle(float angle);

// void startMotor() {
//   ledcSetup(pwmChannel, pwmFreq, pwmResolution);
//   ledcAttachPin(MotPin, pwmChannel);
//   ledcWrite(pwmChannel, 153);  
// }

// void sendStandardScanCommand() {
//   // Send Start Scan command (Standard)
//   LidarSerial.write(0xA5);
//   LidarSerial.write(0x20);
//   delay(10);
// }
// void lightLed(float angle, float dist){
//   if ((angle >= 315 && angle <= 360) || (angle >= 0 && angle <= 45)){
//   digitalWrite(red,HIGH);
//   digitalWrite(green,LOW);
//   digitalWrite(yellow,LOW);
//   digitalWrite(yellow,LOW);
//   digitalWrite(blue,LOW);
// }

// if(angle>45&&angle<=135){
//   digitalWrite(green,LOW);
//   digitalWrite(red,LOW);
//   digitalWrite(yellow,HIGH);
//   digitalWrite(blue,LOW);
// }

// if(angle>135&&angle<=205){
//   digitalWrite(red,LOW);
//   digitalWrite(green,HIGH);
//   digitalWrite(yellow,LOW);
//   digitalWrite(blue,LOW);
// }
// if(angle>205&&angle<315){
//   digitalWrite(red,LOW);
//   digitalWrite(green,LOW);
//   digitalWrite(yellow,LOW);
//   digitalWrite(blue,HIGH);
// }
// }
// void setup() {
//   pinMode(yellow,OUTPUT);
//   pinMode(red,OUTPUT);
//   pinMode(green,OUTPUT);
//   pinMode(blue,OUTPUT);

//   Serial.begin(115200);
//   delay(2000); // Let serial settle

//   startMotor();
//   delay(2000); // Give motor time to spin up

//   LidarSerial.begin(115200, SERIAL_8N1, LIDAR_RX, LIDAR_TX);
//   sendStandardScanCommand();

//   Serial.println("Started standard scan...");
//   lastDataTime = millis();
// }

// void loop() {
//   // // Read and print raw LIDAR bytes in hex
//   while (LidarSerial.available()) {
//     uint8_t b = LidarSerial.read();
//     Serial.printf("%02X ", b);
//     lastDataTime = millis(); // Update last time we saw data
//   }

//   // // Restart scan if no data received in some time
//   // if (millis() - lastDataTime > scanRestartInterval) {
//   //   Serial.println("\nNo data detected. Restarting scan...");
//   //   sendStandardScanCommand();
//   //   lastDataTime = millis();
//   // }

//   // static uint8_t buffer[5];
//   // static int idx = 0;

//   // while (LidarSerial.available()) {
//   //   uint8_t b = LidarSerial.read();

//   //   if (idx == 0 && !isValidHeader(b)) {
//   //     continue; // Wait for a valid start byte
//   //   }

//   //   buffer[idx++] = b;

//   //   if (idx == 5) {
//   //     parsePacket(buffer);
//   //     idx = 0;
//   //   }

//   //   lastDataTime = millis();
//   // }

//   if (millis() - lastDataTime > scanRestartInterval) {
//     Serial.println("\nNo data detected. Restarting scan...");
//     sendStandardScanCommand();
//     lastDataTime = millis();
//   }
// }

// float normalizeAngle(float angle) {
//   while (angle >= 360.0f) angle -= 360.0f;
//   while (angle < 0.0f) angle += 360.0f;
//   return angle;
// }


// bool isValidHeader(uint8_t b) {
//   return (b & 0x01) == 0x01 && ((b & 0x02) == 0x00); // Check start bit and inversion
// }

// void parsePacket(uint8_t* data) {
//   bool isNewScan = ((data[0] & 0x01) == 0x01) && ((data[0] & 0x02) == 0x00);
//   uint8_t quality = data[0] >> 2;
//   uint16_t angle = ((data[1] >> 1) | (data[2] << 7));
//   uint16_t distance = data[3] | (data[4] << 8);
//   if (isNewScan) {
//     Serial.println("---- NEW SCAN ----");
//   }
//   if (distance != 0) {
//     float angleDeg = normalizeAngle(angle / 64.0f);
//     float distMM = distance/4;
//     if (distMM < 50 || distMM > 6000) return;
 
//     Serial.print("A: ");
//     Serial.print(angleDeg, 1);
//     Serial.print("° D: ");
//     Serial.print(distMM, 1);
//     Serial.println(" mm");
//     lightLed(angleDeg,distMM);
//   };
// }


//Here ends the working raw read

// #include <Arduino.h>
// #include <HardwareSerial.h>
// #include <esp32-hal-ledc.h>

// #define LIDAR_RX 16
// #define LIDAR_TX 17
// #define MotPin 25

// const int pwmChannel = 0;
// const int pwmFreq = 25000;
// const int pwmResolution = 8;

// HardwareSerial LidarSerial(2);

// unsigned long lastReadTime = 0;
// const unsigned long timeoutMs = 2000;  // Restart scan if no data in 2 seconds

// void startMotor() {
//   ledcSetup(pwmChannel, pwmFreq, pwmResolution);
//   ledcAttachPin(MotPin, pwmChannel);
//   ledcWrite(pwmChannel, 30);  // Full power
// }

// void sendExpressScanCommand() {
//   // Stop previous scan
//   LidarSerial.write(0xA5);
//   LidarSerial.write(0x25);
//   delay(50);

//   // Express scan command
//   uint8_t expressScan[] = {
//     0xA5, 0x60, 0x20,
//     0x00, 0x00, 0x00, 0x00,
//     0x00, 0x00, 0x00,
//     0x22  // checksum
//   };
//   LidarSerial.write(expressScan, sizeof(expressScan));
// }

// void sendStandardCommand(){
//   LidarSerial.write(0xA5);
//   LidarSerial.write(0x20);
// }

// float normalizeAngle(float angle) {
//   while (angle >= 360.0) angle -= 360.0;
//   while (angle < 0.0) angle += 360.0;
//   return angle;
// }

// void parseCapsule(uint8_t* capsule) {
//   // Basic sync check
//   if ((capsule[0] & 0x0F) != 0x0A) return;

//   // Reset watchdog
//   lastReadTime = millis();

//   uint16_t startAngleRaw = capsule[2] | (capsule[3] << 8);
//   float startAngle = (startAngleRaw >> 1) / 64.0;
//   const float angleInc = 4.5f;

//   // Uncomment for debug
//   // Serial.printf("StartAngle: %.2f\n", startAngle);

//   for (int i = 0; i < 16; i++) {
//     int offset = 4 + i * 5;

//     uint16_t d1 = capsule[offset] | ((capsule[offset + 1] & 0x3F) << 8);
//     uint16_t d2 = capsule[offset + 2] | ((capsule[offset + 3] & 0x3F) << 8);

//     float angle1 = normalizeAngle(startAngle + i * angleInc);
//     float angle2 = normalizeAngle(angle1 + angleInc / 2.0f);

//     // Filter and print d1
//     if (d1 > 50 && d1 < 6000) {
//       Serial.printf("%.1f,%.1f\n", angle1, d1 / 4.0);
//     }

//     // Filter and print d2
//     if (d2 > 50 && d2 < 6000) {
//       Serial.printf("%.1f,%.1f\n", angle2, d2 / 4.0);
//     }
//   }
// }

// void restartScan() {
//   Serial.println("Restarting LIDAR scan...");
//   sendExpressScanCommand();
//   lastReadTime = millis();
// }

// void setup() {
//   Serial.begin(115200);
//   startMotor();
//   delay(500);

//   LidarSerial.begin(115200, SERIAL_8N1, LIDAR_RX, LIDAR_TX);
//   sendExpressScanCommand();
//   Serial.println("Started continuous express scan...");
//   lastReadTime = millis();
// }

// void loop() {
//   static uint8_t capsule[84];
//   static int index = 0;

//   // Restart scan if LIDAR seems silent
//   if (millis() - lastReadTime > timeoutMs) {
//     restartScan();
//     index = 0;  // Clear buffer index to avoid misalignment
//   }

//   while (LidarSerial.available()) {
//     capsule[index++] = LidarSerial.read();

//     if (index == 84) {
//       parseCapsule(capsule);
//       index = 0;
//     }
//   }
// }






// #include <Arduino.h>
// #include <WiFi.h>
// #include <PubSubClient.h>
// #include <dotenv.h>
// #include <ArduinoJson.h>
// #include <enums.h>
// #include <motor.h>
// #include "fns.h"

// WiFiClient espClient;
// PubSubClient client(espClient);
// const String topic= "drive";

// Motor leftMotor(IN1, IN2, ENA, pwmChannel1); 
// Motor rightMotor(IN3, IN4, ENB, pwmChannel2);

// // put function declarations here:
// void startMotor(int, int);
// void receiveData(String);
// void connectWiFi();
// void callback(const char* topic, byte* payload, unsigned int length);
// void connectMQTT();
// void blinkLeds(int first,int second,int third,int fourth);
// void setupMotors();
// bool engineManager(int engineStatus);
// void movementManager(int isMoving, String value, int speed);

// struct ParsedData {
//     bool engine;
//     bool isMoving;
//     const char* moveValue;
//     bool isTurning;
//     const char* directionValue;
//     int speed;
// };

// // Json example
// String getJsonString() {
//     return R"({"engine":true,"move":{"isMoving":true,"value":"w"},"direction":{"isTurning":false,"value":"None"},"speed":50})";
// }

// ParsedData parseJson(String jsonString) {
//     JsonDocument doc = DynamicJsonDocument(512); // Adjust size if needed

//     DeserializationError error = deserializeJson(doc, jsonString);

//     if (error) {
//         Serial.print("Deserialization failed: ");
//         Serial.println(error.f_str());
//         // Return default values if parsing fails
//         return ParsedData();
//     }

//     // Extract values and return them in a struct
//     ParsedData data;
//     data.engine = doc["engine"];
//     data.isMoving = doc["move"]["isMoving"];
//     data.moveValue = doc["move"]["value"];
//     data.isTurning = doc["direction"]["isTurning"];
//     data.directionValue = doc["direction"]["value"];
//     data.speed = doc["speed"];

//     return data;
// }


// void setup() {
//     Serial.begin(115200);
// //    setupMotors();
// //     connectWiFi();
// //    connectMQTT();
  

  
// }


// void loop() {
//     if(WiFi.status()!=WL_CONNECTED){
//         connectWiFi();
//     }
//     if(!client.connected()){
//         connectMQTT();
//     }
//     client.loop();   
//     delay(2000);
//     float scale = 66 / 377;
//     moveRobotTwo(FORWARD,255,255, leftMotor,rightMotor);
//     delay(3000);
//     // moveRobotTwo(FORWARD,200,255, leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,205, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,210, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,215, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,220, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,225, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,230, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,235, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(FORWARD,240, 255,leftMotor,rightMotor);
//     // delay(3000);
//     // moveRobotTwo(LEFT, 150, 150,leftMotor,rightMotor);
//     // delay(3000);
    
//   // moveRobot(RIGHT, 150, 150);
//     moveRobotTwo(RIGHT, 150, 150,leftMotor,rightMotor);
//     delay(1000);
//   //  moveRobot(STOP, 0, 0);
//     moveRobotTwo(STOP, 0, 0,leftMotor,rightMotor);
//     delay(2000);
// }



// void callback(const char* topic, byte* payload, unsigned int length) {
//       Serial.print("Message arrived on topic: ");
//       Serial.println(topic);
//       String response = "";
//       for (int i = 0; i < length; i++) {
//         response += (char)payload[i];
//     }
//     Serial.println(response);
//     receiveData(response);
// }


// void connectWiFi() {
//     digitalWrite(LED_BUILTIN, HIGH);
//     delay(50);
//     WiFi.mode(WIFI_STA);    
//     WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//     Serial.println("Connecting to SSID:");
//     Serial.println(WIFI_SSID);
//     Serial.println("With password:");
//     Serial.println(WIFI_PASSWORD);

//     int retryCount = 0;
//     while (WiFi.status() != WL_CONNECTED && retryCount < 30) {
//         Serial.print(".");
//         digitalWrite(LED_BUILTIN, HIGH);
//         delay(250);
//         digitalWrite(LED_BUILTIN, LOW);
//         delay(250);
//         retryCount++;
//     }

//     if (WiFi.status() == WL_CONNECTED) {
//         Serial.println(" Connected to WiFi!");
//         Serial.println(WiFi.localIP());
//     } else {
//         Serial.println(" Failed to connect to WiFi.");
//     }
// }



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
//           client.subscribe("drive");
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


// void receiveData(String value){
//     // Get parsed values
//     ParsedData data = parseJson(value);

//     // Checks if engine is ON or OFF
//     if (!engineManager(data.engine)) {
//         return;
//     };

//     // Checks for movements
//     movementManager(data.isMoving, data.moveValue, data.speed);
//    //  Serial.print("Is Moving: ");
//    //  Serial.println(data.isMoving);
//    //  Serial.print("Move Value: ");
//    //  Serial.println(data.moveValue);
//    //  Serial.print("Is Turning: ");
//    //  Serial.println(data.isTurning);
//    //  Serial.print("Direction Value: ");
//    //  Serial.println(data.directionValue);
//    //  Serial.print("Speed: ");
//    //  Serial.println(data.speed);
// }


// bool engineManager(int engineStatus) {
//     if (engineStatus == 0) {
//       //  engineSwitch(EngineStatus::OFF);
//       moveRobot(Direction::STOP,0);
//       return false;
//     };

//     return true;
// }


// void movementManager(int isMoving, String value, int speed) {
//     if (isMoving == 0) {
//         return;
//     };

//     if (value.charAt(0) == 'w') {
//             moveRobot(Direction::FORWARD, speed);
//     };
//     if(value.charAt(0)== 's'){
//         moveRobot(Direction::BACKWARD, speed);
//     }
// }


