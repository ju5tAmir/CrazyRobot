#include "lidar.h"
#include "fns.h"

RPLidar lidar;
HardwareSerial LidarSerial(2);
Obstacle obstacles[20];
Gap gaps[10];
int gapCount = 0;
Direction  allowedMovement[]= {FORWARD, BACKWARD,RIGHT,LEFT,STOP};
Point* scanPoints = nullptr;     
int pointCount = 0;              
bool collectingScan = false;
int obstacleCount = 0;
const int TRUST_THRESHOLD = 3; // Minimum trust to consider real obstacle
const int TRUST_DECAY_INTERVAL = 5; // Every 5 scans, decay trust
int scanCounter = 0; // Counts how many scans happened
float frontDangerSum = 0;
int frontDangerCount = 0;

float leftDangerSum = 0;
int leftDangerCount = 0;

float rightDangerSum = 0;
int rightDangerCount = 0;

float backDangerSum = 0;
int backDangerCount = 0;


void initializeHardware() {
    Serial.begin(115200);  
    delay(1000);           
    pinMode(red, OUTPUT);
    pinMode(green, OUTPUT);
    pinMode(RPLIDAR_MOTOR, OUTPUT);
  
    // Start Lidar serial
    LidarSerial.begin(115200, SERIAL_8N1, RPLIDAR_RX, RPLIDAR_TX);
    lidar.begin(LidarSerial);

    // Allocate memory for scan points ONCE
    scanPoints = (Point*) malloc(MAX_POINTS * sizeof(Point));
    if (scanPoints == nullptr) {
        Serial.println("Failed to allocate memory for scanPoints!");
        while (true); // Stop program if critical error
    }
  
    // Detect the device and print info
    rplidar_response_device_info_t info;
    if (IS_OK(lidar.getDeviceInfo(info, 1000))) {
        Serial.println("RPLIDAR detected.");
        Serial.print("Model: "); Serial.println(info.model);
        Serial.print("Firmware: "); Serial.print(info.firmware_version >> 8);
        Serial.print("."); Serial.println(info.firmware_version & 0xFF);
        Serial.print("Hardware: "); Serial.println(info.hardware_version);
        Serial.print("Serial: ");
        for (int i = 0; i < 16; i++) Serial.printf("%02X", info.serialnum[i]);
        startMotor();
        delay(1000); 
        lidar.startScan();
       
    } else {
        Serial.println("RPLIDAR not detected!");
    }
}

void startMotor() {
    ledcSetup(pwmChannel, pwmFreq, pwmResolution);
    ledcAttachPin(RPLIDAR_MOTOR, pwmChannel);
    ledcWrite(pwmChannel, 153);  
}



void readLidarData() {
    if (IS_OK(lidar.waitPoint())) {
        float distance = lidar.getCurrentPoint().distance;
        float angle = lidar.getCurrentPoint().angle;
        bool startBit = lidar.getCurrentPoint().startBit;
        byte quality = lidar.getCurrentPoint().quality;

        if (startBit) {
            // Start of a new scan
            Serial.println("Starting new scan...");
            
            if (collectingScan && pointCount > 0) {
                float averagedDistances[NUM_BUCKETS];
                averageDistances(scanPoints, pointCount, averagedDistances);
                detectAndUpdateObstacles(averagedDistances);

                if (++scanCounter % TRUST_DECAY_INTERVAL == 0) {
                    decayTrust();
                }

                // === Danger evaluation ===
                float frontAvg = (frontDangerCount > 0) ? (frontDangerSum / frontDangerCount) : 9999;
                float leftAvg = (leftDangerCount > 0) ? (leftDangerSum / leftDangerCount) : 9999;
                float rightAvg = (rightDangerCount > 0) ? (rightDangerSum / rightDangerCount) : 9999;
                float backAvg = (backDangerCount > 0) ? (backDangerSum / backDangerCount) : 9999;

                Serial.print("Front Avg: "); Serial.println(frontAvg);
                Serial.print("Left Avg: "); Serial.println(leftAvg);
                Serial.print("Right Avg: "); Serial.println(rightAvg);
                Serial.print("Back Avg: "); Serial.println(backAvg);

                // === Movement Decision or LED Indication ===
                CheckAvailableSpace(frontAvg);

                frontDangerSum = 0;
                frontDangerCount = 0;
                leftDangerSum = 0;
                leftDangerCount = 0;
                rightDangerSum = 0;
                rightDangerCount = 0;
                backDangerSum = 0;
                backDangerCount = 0;

                collectingScan = false;
            }
            
            pointCount = 0;
            collectingScan = true;
        }

        if (collectingScan && distance != 0 && quality > 0 && distance <= 2000) {
            if (pointCount < MAX_POINTS) {
                scanPoints[pointCount++] = {angle, distance};

                // === Classify point into zones ===
                if ((angle <= 15 || angle >= 345)) { // FRONT
                    frontDangerSum += distance;
                    frontDangerCount++;
                } 
                else if (angle >= 75 && angle <= 105) { // LEFT
                    leftDangerSum += distance;
                    leftDangerCount++;
                }
                else if (angle >= 255 && angle <= 285) { // RIGHT
                    rightDangerSum += distance;
                    rightDangerCount++;
                }
                else if (angle >= 165 && angle <= 195) { // BACK
                    backDangerSum += distance;
                    backDangerCount++;
                }
            }
        }
    }
}

void CheckAvailableSpace(float frontAvg, float rightAvg, float leftAvg, float backAvg) {
    bool canBackward = checkIfCanMove(backAvg);
    bool canLeft = checkIfCanMove(leftAvg);
    bool canRight = checkIfCanMove(rightAvg);
    bool canForward = checkIfCanMove(frontAvg);
    bool stopped = false;

    if (!canForward) {
        moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
        removeMovement(FORWARD);
        stopped = true;
        Serial.println("Obstacle detected in FRONT! Stopping...");

        if (canLeft) addMovement(LEFT);
        if (canRight) addMovement(RIGHT);
        if (canBackward) addMovement(BACKWARD);
    }

    if (!canBackward) {
        if(!stopped){
            moveRobotTwo(STOP, 0, 0, leftMotor, rightMotor);
            stopped = true;
        }
        removeMovement(BACKWARD);
        Serial.println("Obstacle detected in BACK!");
       
        if (canForward) addMovement(FORWARD);
        if (canLeft) addMovement(LEFT);
        if (canRight) addMovement(RIGHT);
    }
    if (!canLeft) {
        removeMovement(LEFT);
        Serial.println("Obstacle detected on LEFT!");
    }


    if (!canRight) {
        removeMovement(RIGHT);
        Serial.println("Obstacle detected on RIGHT!");
    }

    if (!stopped && canForward) {
        digitalWrite(red, LOW);
        digitalWrite(green, HIGH);
        Serial.println("Front Clear: Move Forward");
        addMovement(FORWARD); 
        addMovement(LEFT); 
        addMovement(BACKWARD);  
        addMovement(RIGHT); 
    }
    else {
        digitalWrite(red, HIGH);
        digitalWrite(green, LOW);
    }
}


void detectAndUpdateObstacles(float* averageDistances) {
    for (int i = 0; i < NUM_BUCKETS; i++) {
        if (averageDistances[i] < 0) continue;

        int next = (i + 1) % NUM_BUCKETS;
        if (averageDistances[next] < 0) continue;

        if (fabs(averageDistances[i] - averageDistances[next]) < SIMILARITY_TOLERANCE) {
            float newStart = i * ANGLE_BUCKET_SIZE;
            float newEnd = next * ANGLE_BUCKET_SIZE;
            float newDistance = (averageDistances[i] + averageDistances[next]) / 2;

            bool matched = false;
            for (int j = 0; j < obstacleCount; j++) {
                if (abs(obstacles[j].startAngle - newStart) < 10 && abs(obstacles[j].endAngle - newEnd) < 10) {
                    obstacles[j].startAngle = (obstacles[j].startAngle + newStart) / 2;
                    obstacles[j].endAngle = (obstacles[j].endAngle + newEnd) / 2;
                    obstacles[j].distance = (obstacles[j].distance + newDistance) / 2;
                    obstacles[j].trust++;
                    matched = true;
                    break;
                }
            }

            if (!matched && obstacleCount < 20) {
                obstacles[obstacleCount++] = {newStart, newEnd, newDistance, 1};
            }
        }
    }
}

void averageDistances(const Point* measurements, int size, float* output) {
    float sumDistances[NUM_BUCKETS] = {0};
    int countDistances[NUM_BUCKETS] = {0};

    for (int i = 0; i < size; i++) {
        int bucket = (int)(measurements[i].angle / ANGLE_BUCKET_SIZE);
        sumDistances[bucket] += measurements[i].distance;
        countDistances[bucket]++;
    }
    
    for (int i = 0; i < NUM_BUCKETS; i++) {
        if (countDistances[i] > 0)
            output[i] = sumDistances[i] / countDistances[i];
        else
            output[i] = -1; // No data
    }
}



// void detectObstacles(float* averageDistances) {
//     obstacleCount = 0;
//     int consecutive = 0;
//     int startIdx = -1;
//     float sumDistances = 0;
//     int numDistances = 0;

//     for (int i = 0; i < NUM_BUCKETS; i++) {
//         int next = (i + 1) % NUM_BUCKETS;

//         if (averageDistances[i] > 0 && averageDistances[next] > 0) {
//             float diff = fabs(averageDistances[i] - averageDistances[next]);

//             if (diff < SIMILARITY_TOLERANCE) {
//                 if (consecutive == 0) {
//                     startIdx = i;
//                     sumDistances = 0;
//                     numDistances = 0;
//                 }

//                 consecutive++;
//                 sumDistances += averageDistances[i];
//                 numDistances++;
//             } else {
//                 if (consecutive >= MIN_CONSECUTIVE_BUCKETS && obstacleCount < 20) {
//                     Obstacle obs;
//                     obs.startAngle = startIdx * ANGLE_BUCKET_SIZE;
//                     obs.endAngle = i * ANGLE_BUCKET_SIZE;
//                     obs.distance = sumDistances / numDistances;
//                     obstacles[obstacleCount++] = obs;
//                 }
//                 consecutive = 0;
//             }
//         } else {
//             consecutive = 0;
//         }
//     }

//     if (consecutive >= MIN_CONSECUTIVE_BUCKETS && obstacleCount < 20) {
//         Obstacle obs;
//         obs.startAngle = startIdx * ANGLE_BUCKET_SIZE;
//         obs.endAngle = (NUM_BUCKETS - 1) * ANGLE_BUCKET_SIZE;
//         obs.distance = sumDistances / numDistances;
//         obstacles[obstacleCount++] = obs;
//     }
// }

void decayTrust() {
    for (int i = 0; i < obstacleCount; i++) {
        if (obstacles[i].trust > 0) obstacles[i].trust--;
    }
}

float chordLength(float radius_mm, float angle_deg) {
    float angle_rad = radians(angle_deg);
    return 2 * radius_mm * sin(angle_rad / 2);
}

// void printObstacles(const Obstacle* obstacles, int obstacleCount) {
//     Serial.println("Detected Obstacles:");
//     for (int i = 0; i < obstacleCount; i++) {
//         Serial.print("Obstacle ");
//         Serial.print(i);
//         Serial.print(": Start ");
//         Serial.print(obstacles[i].startAngle);
//         Serial.print("°, End ");
//         Serial.print(obstacles[i].endAngle);
//         Serial.print("°, Distance ");
//         Serial.print(obstacles[i].distance, 1);
//         Serial.println(" mm");
//     }
// }


void mergeOverlappingObstacles() {
    if (obstacleCount <= 1) return;

    for (int i = 0; i < obstacleCount - 1; i++) {
        for (int j = i + 1; j < obstacleCount; j++) {
          
            if (!(obstacles[i].endAngle < obstacles[j].startAngle || obstacles[j].endAngle < obstacles[i].startAngle)) {
             
                obstacles[i].startAngle = min(obstacles[i].startAngle, obstacles[j].startAngle);
                obstacles[i].endAngle = max(obstacles[i].endAngle, obstacles[j].endAngle);
                obstacles[i].distance = min(obstacles[i].distance, obstacles[j].distance); 

                for (int k = j; k < obstacleCount - 1; k++) {
                    obstacles[k] = obstacles[k + 1];
                }
                obstacleCount--; 
                j--; 
            }
        }
    }
}


void findGaps(int degrees) {
    gapCount = 0;

    // 1. Sort obstacles by startAngle
    for (int i = 0; i < obstacleCount - 1; i++) {
        for (int j = i + 1; j < obstacleCount; j++) {
            if (obstacles[i].startAngle > obstacles[j].startAngle) {
                Obstacle temp = obstacles[i];
                obstacles[i] = obstacles[j];
                obstacles[j] = temp;
            }
        }
    }

    // 2. Check gaps between obstacles
    for (int i = 0; i < obstacleCount - 1; i++) {
        int gapStart = obstacles[i].endAngle;
        int gapEnd = obstacles[i + 1].startAngle;

        if (gapEnd > gapStart) {
            int gapWidth = gapEnd - gapStart;
            if (gapWidth >= degrees) { // Only consider big enough gaps
                gaps[gapCount++] = {gapStart, gapEnd, gapWidth};
            }
        }
    }

    // 3. Optional: check gap between last obstacle and start of first (wraparound)
    int wrapGapStart = obstacles[obstacleCount - 1].endAngle;
    int wrapGapEnd = obstacles[0].startAngle + 360;
    int wrapGapWidth = wrapGapEnd - wrapGapStart;

    if (wrapGapWidth >= 5) {
        gaps[gapCount++] = {wrapGapStart % 360, wrapGapEnd % 360, wrapGapWidth};
    }
}

void printGaps() {
    Serial.println("Detected Gaps:");
    for (int i = 0; i < gapCount; i++) {
        Serial.print("Gap ");
        Serial.print(i);
        Serial.print(": Start ");
        Serial.print(gaps[i].startAngle);
        Serial.print("°, End ");
        Serial.print(gaps[i].endAngle);
        Serial.print("°, Width ");
        Serial.print(gaps[i].width);
        Serial.println("°");
    }
}


// int getGap() {
//     if (gapCount == 0) {
//         Serial.println("No gaps detected!");
//         return -1; // No free space
//     }

//     int bestGapIndex = -1;
//     int bestScore = 9999; // Lower is better
//     int targetAngle = 0;  // 0° = front of robot

//     for (int i = 0; i < gapCount; i++) {
//         int gapCenter = (gaps[i].startAngle + gaps[i].endAngle) / 2;
//         int distanceFromFront = abs((gapCenter + 360) % 360 - targetAngle); 
//         int penalty = distanceFromFront - gaps[i].width; // Prefer gaps close to 0° and wide

//         if (penalty < bestScore) {
//             bestScore = penalty;
//             bestGapIndex = i;
//         }
//     }

//     if (bestGapIndex != -1) {
//         int bestAngle = (gaps[bestGapIndex].startAngle + gaps[bestGapIndex].endAngle) / 2;
//         Serial.print("Best Direction (Prioritized): ");
//         Serial.print(bestAngle);
//         Serial.println("°");
//         return bestAngle; // <-- This is the angle your robot should go towards
//     }

//     return -1; // No good gap found
// }


float getClosestFrontObstacleDistance() {
    float closest = 9999;
    for (int i = 0; i < obstacleCount; i++) {
        int start = obstacles[i].startAngle;
        int end = obstacles[i].endAngle;
        
        if ((start <= 15 || start >= 345) || (end <= 15 || end >= 345)) {
            if (obstacles[i].distance < closest) {
                closest = obstacles[i].distance;
            }
        }
    }
    return closest;
}



bool checkIfCanMove(float averageDistance){
  return averageDistance>=400;
}


void removeMovement(Direction moveToRemove) {
    for (int i = 0; i < 5; i++) {
      if (allowedMovement[i] == moveToRemove) {
        allowedMovement[i] = NONE;
        break;
      }
    }
  }

  
  void addMovement(Direction moveToAdd) {
    for (int i = 0; i < 5; i++) {
      if (allowedMovement[i] == moveToAdd) {
        return; // already there
      }
    }
    

    for (int i = 0; i < 5; i++) {
      if (allowedMovement[i] == NONE) {
        allowedMovement[i] = moveToAdd;
        break;
      }
    }
  }
  

