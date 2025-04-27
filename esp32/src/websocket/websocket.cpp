
#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <dotenv.h>
#include <ArduinoJson.h>
#include "websocket.h"
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ESPmDNS.h>



bool ledState = 0;
const int ledPin = 2;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");






//The notifyClients() function notifies all clients with a message containing whatever you pass as a argument. In this case, we’ll want to notify all clients of the current LED state whenever there’s a change.
void notifyClients() {
  ws.textAll(String(ledState));
}


// used to handle message snt from the websockets connecccted clients
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    if (strcmp((char*)data, "toggle") == 0) {
      ledState = !ledState;
      Serial.println("Received");
      notifyClients();
    }
  }
}


//  this is used to atacch event on the server , from the client
void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}



void initializeWebSocketServer(){
 
  // Connect to Wi-Fi
  connectWiFi();

  // Print ESP Local IP Address
  Serial.println(WiFi.localIP());

  initWebSocket();

  // Start server
  server.begin();
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
        if (!MDNS.begin("crazyrobot")) {  // esp32.local
            Serial.println("Error starting mDNS");
            return;
          }
          Serial.println("mDNS responder started");
    } else {
        Serial.println(" Failed to connect to WiFi.");
    }
}
