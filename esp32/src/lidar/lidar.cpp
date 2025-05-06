#include "lidar.h"
#include "fns.h"
#include "../models/models.h"

RPLidar lidar;
HardwareSerial LidarSerial(2);
Gap gaps[10];
int gapCount = 0;

Point* scanPoints = nullptr;     

int pointCount = 0;              
bool collectingScan = false;

const int TRUST_THRESHOLD = 3; // Minimum trust to consider real obstacle
const int TRUST_DECAY_INTERVAL = 5; // Every 5 scans, decay trust
int scanCounter = 0; // Counts how many scans happened


bool initializeHardware() {
    delay(1000);
    pinMode(RPLIDAR_MOTOR, OUTPUT);
    LidarSerial.begin(115200, SERIAL_8N1, RPLIDAR_RX, RPLIDAR_TX);
    lidar.begin(LidarSerial);

    scanPoints = (Point*) malloc(MAX_POINTS * sizeof(Point));
    delay(1000);
    if (!scanPoints) {
        Serial.println("Failed to allocate memory for scanPoints!");
        return false;
    }
    rplidar_response_device_info_t info;
    if (!IS_OK(lidar.getDeviceInfo(info, 1000))) {
        Serial.println("RPLIDAR not detected!");
        return false;
    }
    Serial.println("RPLIDAR detected.");
    startMotor();
    delay(3000);
    u_result result = lidar.startScan(false);  
if (!IS_OK(result)) {
    Serial.print("Failed to start scan! Error code: ");
    Serial.println(result, HEX);
    return false;
}

collectingScan=false;
pointCount = 0;  
    
    Serial.println("LIDAR scan started successfully.");
    return true;
}


//put millis instead off delay
bool stopLidar(){
    lidar.stop();
    ledcWrite(pwmChannel,0);
    collectingScan=false;
    pointCount = 0; 
    return true;
}



void startMotor() {
    ledcSetup(pwmChannel, pwmFreq, pwmResolution);
    ledcAttachPin(RPLIDAR_MOTOR, pwmChannel);
  ledcWrite(pwmChannel, 153); 
}

void readLidarData(RobotData* data) {
    // Serial.println(data->lidarHealth);
    // Serial.println(data->lidarReady + "Ready lidar");
    // Serial.println("\n=== NEW SCAN STARTED ===");
    if (IS_OK(lidar.waitPoint())) { 
        RPLidarMeasurement point  = lidar.getCurrentPoint();
        float distance = point.distance;
        float angle = point.angle;
        byte quality = point.quality;
        bool startBit = point.startBit;
    
      
    
        if (point.distance > 0 && point.quality > 0) {
          
            // You can process/store the point here
        } else {
           // Serial.println("[WARN] Received zeroed point after waitPoint.");
        }


        if(startBit){
  
            if (collectingScan && pointCount > 0) {
                float averagedDistances[NUM_BUCKETS];
                 averageDistances(scanPoints, pointCount, averagedDistances);
                detectAndUpdateObstacles(averagedDistances,data);
            }
        
    
            pointCount = 0;
            collectingScan = true;
        }
        
            if (collectingScan && distance != 0 && quality > 0 && distance <= 2000) {
                if (pointCount < MAX_POINTS) {
                    scanPoints[pointCount++] = {angle, distance};
    
                }
            }
    
    } else {
     //   Serial.println("[WARN] waitPoint() timed out — no data.");
    }


}

// void readLidarData() {
//     Serial.println("Starting new scan...");
 
//     if (IS_OK(lidar.waitPoint())) {
//         float distance = lidar.getCurrentPoint().distance;
//         float angle = lidar.getCurrentPoint().angle;
//         bool startBit = lidar.getCurrentPoint().startBit;
//         byte quality = lidar.getCurrentPoint().quality;

//         if (startBit) {
//             // Start of a new scan
//             Serial.println("Starting new scan...");
            
//             if (collectingScan && pointCount > 0) {
//                 float averagedDistances[NUM_BUCKETS];
//                 averageDistances(scanPoints, pointCount, averagedDistances);
//                 detectAndUpdateObstacles(averagedDistances);

//                 if (++scanCounter % TRUST_DECAY_INTERVAL == 0) {
//                     decayTrust();
//                 }

//                 // === Danger evaluation ===
//                 float frontAvg = (frontDangerCount > 0) ? (frontDangerSum / frontDangerCount) : 9999;
//                 float leftAvg = (leftDangerCount > 0) ? (leftDangerSum / leftDangerCount) : 9999;
//                 float rightAvg = (rightDangerCount > 0) ? (rightDangerSum / rightDangerCount) : 9999;
//                 float backAvg = (backDangerCount > 0) ? (backDangerSum / backDangerCount) : 9999;

//                 Serial.print("Front Avg: "); Serial.println(frontAvg);
//                 Serial.print("Left Avg: "); Serial.println(leftAvg);
//                 Serial.print("Right Avg: "); Serial.println(rightAvg);
//                 Serial.print("Back Avg: "); Serial.println(backAvg);

//                 // === Movement Decision or LED Indication ===
//                 CheckAvailableSpace(frontAvg,rightAvg,leftAvg,backAvg);

//                 frontDangerSum = 0;
//                 frontDangerCount = 0;
//                 leftDangerSum = 0;
//                 leftDangerCount = 0;
//                 rightDangerSum = 0;
//                 rightDangerCount = 0;
//                 backDangerSum = 0;
//                 backDangerCount = 0;

//                 collectingScan = false;
//             }
            
//             pointCount = 0;
//             collectingScan = true;
//         }

//         if (collectingScan && distance != 0 && quality > 0 && distance <= 2000) {
//             if (pointCount < MAX_POINTS) {
//                 scanPoints[pointCount++] = {angle, distance};

//                 // === Classify point into zones ===
//                 if ((angle <= 15 || angle >= 345)) { // FRONT
//                     frontDangerSum += distance;
//                     frontDangerCount++;
//                 } 
//                 else if (angle >= 75 && angle <= 105) { // LEFT
//                     leftDangerSum += distance;
//                     leftDangerCount++;
//                 }
//                 else if (angle >= 255 && angle <= 285) { // RIGHT
//                     rightDangerSum += distance;
//                     rightDangerCount++;
//                 }
//                 else if (angle >= 165 && angle <= 195) { // BACK
//                     backDangerSum += distance;
//                     backDangerCount++;
//                 }
//             }
//         }
//     }
// }






// void detectAndUpdateObstacles(float* averageDistances, RobotData* robot) {
//     Obstacle obstaclesTemp[72] = {}; 
//     for (int i = 0; i < NUM_BUCKETS; i++) {
//         if (averageDistances[i] < 0) continue;
//         int next = (i + 1) % NUM_BUCKETS;
//         //IF NO MEASUREMENTS SKIP OVER,
//         if (averageDistances[next] < 0) continue;
//         if (fabs(averageDistances[i] - averageDistances[next]) < SIMILARITY_TOLERANCE) {
//             //Define a new potential obstacle
//             float newStart = i * ANGLE_BUCKET_SIZE;
//             float newEnd = next * ANGLE_BUCKET_SIZE;
//             float newDistance = (averageDistances[i] + averageDistances[next]) / 2;
//             obstaclesTemp[obstacleCount++] = {newStart, newEnd, newDistance};  
//                           //CHECK FOR SIMILARITY WITHIN THE REGISTERED ONES 
//                           bool matched = false;
//                           for (int j = 0; j < obstacleCount; j++) {
//                             if (abs(robot->obstacles[j].startAngle - newStart) < 10 && abs(robot->obstacles[j].endAngle - newEnd) < 10) {
//                                 robot->obstacles[j].startAngle = ( robot->obstacles[j].startAngle + newStart) / 2;
//                                 robot->  obstacles[j].endAngle = ( robot->obstacles[j].endAngle + newEnd) / 2;
//                                 robot-> obstacles[j].distance = ( robot->obstacles[j].distance + newDistance) / 2;
//                                 matched = true;
//                                 break;
//                             }
//                         }
            
//                         if (!matched && obstacleCount < 20) {
//                             robot-> obstacles[obstacleCount++] = {newStart, newEnd, newDistance};
//                         }          
            
//         }
//     }
// }

void detectAndUpdateObstacles(float* averageDistances, RobotData* robot) {
   
    Obstacle obstaclesTemp[NUM_BUCKETS];
    int tempCount = 0;

    int i = 0;

  //check for similar distances between the buckets
    while (i < NUM_BUCKETS) {
        if (averageDistances[i] < 0) {
            i++;
            continue;
        }

        float startAngle = i * ANGLE_BUCKET_SIZE;
        float sumDist = averageDistances[i];
        int count = 1;
        int j = i + 1;
       // chain similar buckets into a bigger object
        while (j < NUM_BUCKETS &&
               averageDistances[j] >= 0 &&
               fabs(averageDistances[j] - averageDistances[j - 1]) < SIMILARITY_TOLERANCE) {
            sumDist += averageDistances[j];
            count++;
            j++;
        }

        float endAngle = (j - 1) * ANGLE_BUCKET_SIZE;
        float avgDist = sumDist / count;

        obstaclesTemp[tempCount++] = { startAngle, endAngle, avgDist };

        i = j; 
    }

    Obstacle merged[NUM_BUCKETS];
    int mergedCount = 0;

    for (int i = 0; i < tempCount; i++) {
        Obstacle& newObs = obstaclesTemp[i];
        bool mergedExisting = false;

        for (int j = 0; j < mergedCount; j++) {
            Obstacle& existing = merged[j];
            if (!(newObs.endAngle < existing.startAngle || newObs.startAngle > existing.endAngle)) {
                existing.startAngle = min(existing.startAngle, newObs.startAngle);
                existing.endAngle = max(existing.endAngle, newObs.endAngle);
                existing.distance = (existing.distance + newObs.distance) / 2;
                mergedExisting = true;
                break;
            }
        }
        if (!mergedExisting && mergedCount < NUM_BUCKETS) {
            merged[mergedCount++] = newObs;
        }
    }
 
     //keep old reading
    for (int i = 0; i < NUM_BUCKETS; i++) {
        robot->previousObstacles[i] = robot->obstacles[i];
    }
    //add new reading 
    for (int i = 0; i < mergedCount; i++) {
        robot->obstacles[i] = merged[i];
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
            output[i] = -1; 
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


// void mergeOverlappingObstacles(RobotData * robot) {
//     if (obstacleCount <= 1) return;

//     for (int i = 0; i < obstacleCount - 1; i++) {
//         for (int j = i + 1; j < obstacleCount; j++) {
          
//             if (!(robot->obstacles[i].endAngle < robot->obstacles[j].startAngle || robot->obstacles[j].endAngle < robot->obstacles[i].startAngle)) {
             
//                 robot-> obstacles[i].startAngle = min(robot->obstacles[i].startAngle, robot->obstacles[j].startAngle);
//                 robot->obstacles[i].endAngle = max(robot->obstacles[i].endAngle,robot-> obstacles[j].endAngle);
//                 robot->obstacles[i].distance = min(robot->obstacles[i].distance, robot->obstacles[j].distance); 

//                 for (int k = j; k < obstacleCount - 1; k++) {
//                     robot-> obstacles[k] = robot->obstacles[k + 1];
//                 }
//                 obstacleCount--; 
//                 j--; 
//             }
//         }
//     }
// }


// void findGaps(int degrees ,RobotData*  robot) {
//     gapCount = 0;

//     // 1. Sort obstacles by startAngle
//     for (int i = 0; i < obstacleCount - 1; i++) {
//         for (int j = i + 1; j < obstacleCount; j++) {
//             if (robot->obstacles[i].startAngle > robot->obstacles[j].startAngle) {
//                 Obstacle temp = robot->obstacles[i];
//                 robot->obstacles[i] =robot->obstacles[j];
//                 robot-> obstacles[j] = temp;
//             }
//         }
//     }

//     // 2. Check gaps between obstacles
//     for (int i = 0; i < obstacleCount - 1; i++) {
//         int gapStart = robot-> obstacles[i].endAngle;
//         int gapEnd =robot-> obstacles[i + 1].startAngle;

//         if (gapEnd > gapStart) {
//             int gapWidth = gapEnd - gapStart;
//             if (gapWidth >= degrees) { // Only consider big enough gaps
//                 gaps[gapCount++] = {gapStart, gapEnd, gapWidth};
//             }
//         }
//     }

//     // 3. Optional: check gap between last obstacle and start of first (wraparound)
//     int wrapGapStart = robot->obstacles[obstacleCount - 1].endAngle;
//     int wrapGapEnd =robot-> obstacles[0].startAngle + 360;
//     int wrapGapWidth = wrapGapEnd - wrapGapStart;

//     if (wrapGapWidth >= 5) {
//         gaps[gapCount++] = {wrapGapStart % 360, wrapGapEnd % 360, wrapGapWidth};
//     }
// }

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







  
  

