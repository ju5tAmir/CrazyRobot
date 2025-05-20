#include <Arduino.h>
#include "../models/models.h"
#include "zoneDetection.h"
#include "../commands/commands.h"
#define NUM_DIRECTIONS 4

const int DIST_SEVERE_MIN = 50;
const int DIST_SEVERE_MAX = 450;
const int DIST_MILD_MAX   = 700;
const int DIST_IGNORE_MAX = 700;
const int STABILITY_RISE_THRESHOLD = 2;
const int STABILITY_FALL_THRESHOLD = 3;

int warningRising[NUM_DIRECTIONS] = {0};
int warningFalling[NUM_DIRECTIONS] = {0};
const String directions[NUM_DIRECTIONS] = {FT, BK, LT, RT};
String warnings[NUM_DIRECTIONS] = {FREE, FREE, FREE, FREE};
String lastWarnings[NUM_DIRECTIONS] = {FREE, FREE, FREE, FREE};
int directionIndex(const String direction) {
    if (direction == FT) return 0;
    if (direction == BK) return 1;
    if (direction == LT) return 2;
    if (direction == RT) return 3;
    return -1;
}

// 4 primary direction zones
DirectionZone directionZones[NUM_DIRECTIONS] = {
  { FT,  0.0f,   45.0f },
  { BK,  180.0f, 45.0f },
  { LT,  270.0f, 45.0f },  
  { RT,  90.0f,  45.0f }
};


float degreesForWidthAtDistance(float width_cm, float distance_cm) {
  float half_angle_rad = atan2f(width_cm / 2.0f, distance_cm);
  return max((float)degrees(half_angle_rad), 10.0f);  
}


bool angleInInterval(float a, float start, float end) {
  return (start <= end) ? (a >= start && a <= end) : (a >= start || a <= end);
}

bool rangesOverlap(float s1, float e1, float s2, float e2) {
  if (s1 == e1 || s2 == e2) return false;
  return angleInInterval(s1, s2, e2) || angleInInterval(e1, s2, e2) ||
         angleInInterval(s2, s1, e1) || angleInInterval(e2, s1, e1);
}

bool obstacleInDirectionZone(const Obstacle& obs, float centerAngle, float widthCm) {
  float dist = obs.distance;
  if (dist <= 0 || dist > DIST_IGNORE_MAX) return false;

  float halfSpan = degreesForWidthAtDistance(widthCm, dist);
  float start = fmod(centerAngle - halfSpan + 360.0f, 360.0f);
  float end   = fmod(centerAngle + halfSpan, 360.0f);
  return rangesOverlap(obs.startAngle, obs.endAngle, start, end);
}


void applyWarningWithStability(int index, const String& newLevel) {
  if (index < 0 || index >= NUM_DIRECTIONS) return;

  if (newLevel != FREE) {
    warningFalling[index] = 0;  
    warningRising[index]++;

    if (warningRising[index] >= STABILITY_RISE_THRESHOLD) {
      warnings[index] = newLevel;
    }

  } else {
    warningRising[index] = 0;  
    warningFalling[index]++;

    if (warningFalling[index] >= STABILITY_FALL_THRESHOLD) {
      warnings[index] = FREE;
    }
  }
}




void updateObstaclesPerRegion(Obstacle* obstacles, int count, HardwareSerial &serial) {
  // Reset warning states
  for (int i = 0; i < NUM_DIRECTIONS; i++) {
    warnings[i] = FREE;
  }

  for (int i = 0; i < count; i++) {
    Obstacle obs = obstacles[i];
    float dist = obs.distance;
    if (dist <= 0 || dist > DIST_IGNORE_MAX) continue;

    Serial.print("Obstacle: ");
    Serial.print(obs.startAngle); Serial.print(" - ");
    Serial.print(obs.endAngle); Serial.print(", Dist=");
    Serial.println(dist);

    for (int z = 0; z < NUM_DIRECTIONS; z++) {
      DirectionZone& zone = directionZones[z];

      if (obstacleInDirectionZone(obs, zone.centerAngle, zone.widthCm)) {
        //    if (dist >= DIST_SEVERE_MIN && dist <= DIST_SEVERE_MAX) {
        //   applyWarningWithStability(z, SEVERE);
        // } else if (dist > DIST_SEVERE_MAX && dist <= DIST_MILD_MAX) {
        //   if (warnings[z] != SEVERE) applyWarningWithStability(z, MILD);
        // }


        if (dist >= DIST_SEVERE_MIN && dist <= DIST_SEVERE_MAX) {
            applyWarningWithStability(z, SEVERE); // GOOD
} else if (dist > DIST_SEVERE_MAX && dist <= DIST_MILD_MAX && warnings[z] != SEVERE) {
  applyWarningWithStability(z, MILD); 
}

        // if (dist >= DIST_SEVERE_MIN && dist <= DIST_SEVERE_MAX) {
        //   warnings[z] = SEVERE;
        // } else if (dist > DIST_SEVERE_MAX && dist <= DIST_MILD_MAX && warnings[z] != SEVERE) {
        //   warnings[z] = MILD;
        // }
      }
    }
  }

  // Check for changes
  bool changed = false;
  for (int i = 0; i < NUM_DIRECTIONS; i++) {
    if (warnings[i] != lastWarnings[i]) {
      changed = true;
      break;
    }
  }

  if (changed) {
    String warning = "";
    for (int i = 0; i < NUM_DIRECTIONS; i++) {
      if (i > 0) warning += ",";
      warning += warnings[i];
      lastWarnings[i] = warnings[i];
    }
    warning+=",";
    warning+=Terminator;
    serial.print(warning);
    Serial.print("⚠️ Warning changed: ");
    Serial.println(warning);
  }
}
