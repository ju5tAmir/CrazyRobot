
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
    char activeMovements[4]={ '_', '_', '_', '_' };
    bool isStopped = true;
    bool lidarHealth=true;
    bool negativeDanger=false;
    /// @brief is used to block movements that are not allowed by the sensors, a negative space, obstacles
    ///@brief not allowed movements will be replaced with '_' character
    char allowedMovements[4]={'w','a','s','d'};
    String lidarWarnings = "";
   // ServoData servo;
};

// save the time when the message arrived for synchronizing
struct LidarMessage {
  String command="";
  unsigned long timestamp;
       LidarMessage() {};
      LidarMessage(String& t, unsigned long ts)
    : command(t), timestamp(ts) {}
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
