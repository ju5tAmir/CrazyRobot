#include <models/models.h>

#ifndef OBSTACLES_h
#define OBSTACLES_h
boolean detectObstacles (RobotData * robot);
float getClosestFrontObstacleDistance(RobotData* robot);
bool checkIfCanMove(float averageDistance);
void removeMovement(Direction moveToRemove);
void addMovement(Direction moveToAdd);
void CheckAvailableSpace(float frontAvg, float rightAvg, float leftAvg, float backAvg);
boolean checkFront(Obstacle obstacle);
#endif
