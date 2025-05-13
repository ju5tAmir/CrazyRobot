
#include <WiFi.h>
#ifndef MODELS_h
#define MODELS_h



struct Obstacle {
    float startAngle;
    float endAngle;
    float distance;
};


struct LidarState {
 bool lidarReady = false; 
     Obstacle obstacles[72] = {}; 
    int currentObstaclesCount = 0;
};



// struct RobotData {
//     bool isMoving=false;
//     bool initializing = false;
//     bool isStopping = false;
//     char activeMovements[4]={ '_', '_', '_', '_' };  
//     bool isStopped = true;
//     bool lidarReady = false;
//     bool lidarHealth=true;
//     bool negativeDanger=false;
//     /// @brief is used to block movements that are not allowed by the sensors, a negative space, obstacles
//     ///@brief not allowed movements will be replaced with '_' character
//     char allowedMovements[4]={'w','a','s','d'};
//     Obstacle previousObstacles[72] = {};
//     Obstacle obstacles[72] = {}; 
//     int currentObstaclesCount = 0;
    
//     // const char* moveValue;
//     // bool isTurning;
//     // const char* directionValue;
//     // int speed;
// };

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
