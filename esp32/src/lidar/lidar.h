
#include <RPLidar.h>
#include <esp32-hal-ledc.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h>
#include "fns.h"
#include "../models/models.h"

#ifndef LIDAR_h
#define LIDAR_h
#define RPLIDAR_MOTOR 14
#define RPLIDAR_RX 16
#define RPLIDAR_TX 17   

extern RPLidar lidar;
extern SemaphoreHandle_t robotMutex;
bool stopLidar();
extern HardwareSerial LidarSerial;
const int ANGLE_BUCKET_SIZE = 5; 
const int NUM_BUCKETS = 360 / ANGLE_BUCKET_SIZE;
const float SIMILARITY_TOLERANCE = 70; // mm
//const int MIN_CONSECUTIVE_BUCKETS = 3;  // Minimum similar readings
const int MAX_POINTS = 1000;  
extern Point* scanPoints;    
extern int pointCount;
extern bool collectingScan;
void detectAndUpdateObstacles(float * averageDistances,RobotData *robot);
// void mergeOverlappingObstacles(RobotData* robot);


void printGaps();
void findGaps(int degrees,RobotData* robot);
const int pwmChannel = 0;
const int pwmFreq = 25000;
const int pwmResolution = 8;
extern String warnings[];
extern String lastWarnings[4];

extern const String directions[4];
int directionIndex(const String direction);

// void printObstacles(const Obstacle* obstacles, int obstacleCount);

void averageDistances(const Point* measurements, int size,float* output);
float chordLength(float radius_mm, float angle_deg);
bool initializeHardware();
void startMotor();
void readLidarData(RobotData* data); 

void CheckAvailableSpace(float frontAvg, float rightAvg, float leftAvg, float backAvg);
bool isDirectionAllowed(Direction dir);
#endif
