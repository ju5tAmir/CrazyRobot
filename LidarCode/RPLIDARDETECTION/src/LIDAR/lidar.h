
#include <RPLidar.h>
#include <esp32-hal-ledc.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h>
#include "./models/models.h"

#ifndef LIDAR_h
#define LIDAR_h
#define RPLIDAR_MOTOR 14
#define RPLIDAR_RX 16
#define RPLIDAR_TX 17   

extern RPLidar lidar;

extern HardwareSerial LidarSerial;



extern Point* scanPoints;    
extern int pointCount;
//old method , not used
// void detectAndUpdateObstacles(float * averageDistances,RobotData *robot);


// new method , used to detect obstacles from points readings 
void detectAndUpdateObstacles(float* averageDistances, int* countDistances, LidarState* lidar);
// method to check is an obstacle is persistent across scans
bool isPersistentObstacle(const Obstacle& candidate, const LidarState* lidar);
// void mergeOverlappingObstacles(RobotData* robot);


void printGaps();
// void findGaps(int degrees,RobotData* robot);
const int pwmChannel = 0;
const int pwmFreq = 25000;
const int pwmResolution = 8;
extern String warnings[];
extern String lastWarnings[4];
extern bool scanComplete;
extern const String directions[4];
extern const String directions[4];
int directionIndex(const String direction);
String getDirectionForAngle(float angle);

extern const int MIN_OBJECT_WIDTH_DEG;
// int directionIndex(const String direction);

// void printObstacles(const Obstacle* obstacles, int obstacleCount);
// old average method
// void averageDistances(const Point* measurements, int size,float* output);

//new average method that outputs also how manny readings are  per bucket
void averageDistances(const Point* measurements, int size, float* output, int* countOut);
float chordLength(float radius_mm, float angle_deg);
bool initializeHardware(LidarState &lidarState);
bool stopLidar(LidarState &lidarState);
void startMotor();
void readLidarData(LidarState* lidar); 

// void CheckAvailableSpace(float frontAvg, float rightAvg, float leftAvg, float backAvg);
// bool isDirectionAllowed(Direction dir);
#endif
