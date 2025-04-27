#include <esp32-hal-ledc.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#ifndef WEBSOCKET_h
#define  WEBSOCKET_h


extern AsyncWebServer server;
extern AsyncWebSocket ws;
void initializeWebSocketServer();
void connectWiFi();





#endif
