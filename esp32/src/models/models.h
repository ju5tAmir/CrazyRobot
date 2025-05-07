
#include <WiFi.h>
#include <PubSubClient.h>
#ifndef MODELS_h
#define MODELS_h
extern WiFiClient espClient;
extern PubSubClient client;


struct Obstacle {
    float startAngle;
    float endAngle;
    float distance;
};

struct RobotData {
    bool isMoving=false;
    bool initializing = false;
    bool isStopping = false;
    const char* activeMovements[4]={ nullptr, nullptr, nullptr, nullptr };  
    bool isStopped = true;
    bool lidarReady = false;
    bool lidarHealth=true;
    bool negativeDanger=false;
    /// @brief is used to block movements that are not allowed by the sensors, a negative space, obstacles
    ///@brief not allowed movements will be replaced with '_' character
    char allowedMovements[4]={'w','a','s','d'};
    Obstacle previousObstacles[72] = {};
    Obstacle obstacles[72] = {}; 
    
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
struct Point
{
    float angle;
    float distance;
};


struct Gap {
    int startAngle;
    int endAngle;
    int width;
};


enum DIRECTION { 
    FRONT,
    RIGHTR,
    LEFTL,
    BACK,
    
};

enum Direction {FORWARD, BACKWARD,RIGHT,LEFT, STOP,NONE,FORWARD_LEFT, FORWARD_RIGHT, BACKWARD_LEFT, BACKWARD_RIGHT,BRAKING};
extern Direction allowedMovement[5];

#endif
