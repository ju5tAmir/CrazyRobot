
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
void detectAndUpdateObstacles(float* averageDistances, int* countDistances, LidarState* lidar);
bool isPersistentObstacle(const Obstacle& candidate, const LidarState* lidar);
const int pwmChannel = 0;
const int pwmFreq = 25000;
const int pwmResolution = 8;
extern bool scanComplete;
extern const int MIN_OBJECT_WIDTH_DEG;
void averageDistances(const Point* measurements, int size, float* output, int* countOut);
bool initializeHardware(LidarState &lidarState);
const int* getDynamicGroupSizes(float dist, int& sizeOut);
bool stopLidar(LidarState &lidarState);
void startMotor();
void readLidarData(LidarState* lidar); 
#endif
