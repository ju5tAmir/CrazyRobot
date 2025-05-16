
#include <WiFi.h>
#ifndef MODELS_h
#define MODELS_h
const int ANGLE_BUCKET_SIZE = 3; 
const int NUM_BUCKETS = 360 / ANGLE_BUCKET_SIZE;
const float SIMILARITY_TOLERANCE = 50; // mm 
const int MAX_POINTS = 1000;  
const int MERGE_ANGLE_TOLERANCE=7;
const int MAX_HISTORY= 5;




struct Obstacle {
    float startAngle;
    float endAngle;
    float distance;
};

struct DirectionZone {
  String name;
  float centerAngle;
  float widthCm;
};


struct LidarState {
 bool lidarReady = false; 
     Obstacle obstacles[NUM_BUCKETS] = {}; 
    int currentObstaclesCount = 0;
    Obstacle history[MAX_HISTORY][NUM_BUCKETS];
    int historyCounts[MAX_HISTORY];
    int historyIndex;
    bool fullScanForProcessing= false;
    bool collectingScan=false;
    Obstacle obstacleBuffers[2][NUM_BUCKETS];
    int obstacleCounts[2] = {0, 0};
    int activeBufferIndex = 0;
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
