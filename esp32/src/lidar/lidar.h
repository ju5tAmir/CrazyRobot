
#include <RPLidar.h>
#include <esp32-hal-ledc.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h>
#include "fns.h"
#ifndef LIDAR_h
#define LIDAR_h
#define RPLIDAR_MOTOR 4
#define RPLIDAR_RX 16
#define RPLIDAR_TX 17   
#define red 13
#define green 14
struct Point
{
    float angle;
    float distance;
};
struct Obstacle {
    float startAngle;
    float endAngle;
    float distance;
    int trust;
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



extern RPLidar lidar;
extern HardwareSerial LidarSerial;
const int ANGLE_BUCKET_SIZE = 5; 
const int NUM_BUCKETS = 360 / ANGLE_BUCKET_SIZE;
const float SIMILARITY_TOLERANCE = 20; // mm
const int MIN_CONSECUTIVE_BUCKETS = 3;  // Minimum similar readings
const int MAX_POINTS = 1000;  // Max expected points per full 360° scan
extern Point* scanPoints;    // <- extern = "this exists somewhere else"
extern int pointCount;
extern bool collectingScan;
void detectAndUpdateObstacles(float * averageDistances);
void mergeOverlappingObstacles();
float getClosestFrontObstacleDistance();
void decayTrust();
float getClosestFrontObstacleDistance();
bool checkIfCanMove(float averageDistance);
void removeMovement(Direction moveToRemove);
void addMovement(Direction moveToAdd);

void printGaps();
void findGaps(int degrees);

const int pwmChannel = 0;
const int pwmFreq = 25000;
const int pwmResolution = 8;
// void printObstacles(const Obstacle* obstacles, int obstacleCount);

void averageDistances(const Point* measurements, int size,float* output);
float chordLength(float radius_mm, float angle_deg);
void initializeHardware();
void startMotor();
void readLidarData();

void CheckAvailableSpace(float frontAvg, float rightAvg, float leftAvg, float backAvg);
bool isDirectionAllowed(Direction dir);
#endif
