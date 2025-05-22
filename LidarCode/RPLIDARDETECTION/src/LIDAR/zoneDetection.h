
#include "../models/models.h"
#ifndef ZONEDETECTION_h
#define ZONEDETECTION_h
#define NUM_DIRECTIONS 4

void updateObstaclesPerRegion(Obstacle* obstacles, int count, HardwareSerial &serial);
void applyWarningWithStability(int index, const String& newLevel);
bool angleInInterval(float a, float start, float end);
float degreesForWidthAtDistance(float width_cm, float distance_cm);
extern String warnings[NUM_DIRECTIONS];
extern String lastWarnings[NUM_DIRECTIONS];
extern const String directions[NUM_DIRECTIONS];
int directionIndex(const String direction);

#endif
