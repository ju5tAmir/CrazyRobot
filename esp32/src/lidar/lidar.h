
#include <RPLidar.h>
#include <esp32-hal-ledc.h>
#include <esp32-hal-gpio.h>
#include <Arduino.h>
#ifndef LIDAR_h
#define LIDAR_h
#define RPLIDAR_MOTOR 25
#define RPLIDAR_RX 16
#define RPLIDAR_TX 17   
#define yellow 26
#define red 13
#define green 14
#define blue 0
struct Point
{
    float angle;
    float distance;
};
struct Obstacle {
    int startAngle;
    int endAngle;
    float distance;
};

extern RPLidar lidar;
extern HardwareSerial LidarSerial;
const int ANGLE_BUCKET_SIZE = 5; 
const int NUM_BUCKETS = 360 / ANGLE_BUCKET_SIZE;
const float SIMILARITY_TOLERANCE = 100; // mm
const int MIN_CONSECUTIVE_BUCKETS = 3;  // Minimum similar readings
const int MAX_POINTS = 1000;  // Max expected points per full 360° scan
extern Point* scanPoints;    // <- extern = "this exists somewhere else"
extern int pointCount;
extern bool collectingScan;





const int SimilarityDistanceTreshhold = 20;  // for our project we can play and increase up to 100 mm;




const int pwmChannel = 0;
const int pwmFreq = 25000;
const int pwmResolution = 8;
void printObstacles(const Obstacle* obstacles, int obstacleCount);
void detectObstacles(float * averageDistances);
void averageDistances(const Point* measurements, int size,float* output);
float chordLength(float radius_mm, float angle_deg);
void initializeHardware();
void startMotor();
void lightLed(float angle, float dist);
void readLidarData();

#endif
