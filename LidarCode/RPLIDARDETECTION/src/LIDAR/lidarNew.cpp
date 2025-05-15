#include "lidar.h"
#include "./models/models.h"
#include "../commands/commands.h"

RPLidar lidar;
HardwareSerial LidarSerial(2);
float lastScanTime = 0;

const int MIN_OBJECT_WIDTH_DEG=3;
Point* scanPoints = nullptr;     

int pointCount = 0;              
const String directions[4] = {FT, BK, LT, RT};
String warnings[4] = {FREE, FREE, FREE, FREE};
String lastWarnings[4] = {FREE, FREE, FREE, FREE};

int directionIndex(const String direction) {
    if (direction == FT) return 0;
    if (direction==BK) return 1;
    if (direction==LT) return 2;
    if (direction==RT) return 3;
    return -1;
  }

bool initializeHardware(LidarState &lidarState) {
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
lidarState.collectingScan=false;
pointCount = 0;  
    Serial.println("LIDAR scan started successfully.");
    return true;
}


//Stop the lidar 
bool stopLidar(LidarState &lidarState){
    lidar.stop();
    ledcWrite(pwmChannel,0);
    lidarState.collectingScan=false;
    pointCount = 0; 
    return true;
}


//start the motor of the lidar 
void startMotor() {
    ledcSetup(pwmChannel, pwmFreq, pwmResolution);
    ledcAttachPin(RPLIDAR_MOTOR, pwmChannel);
  ledcWrite(pwmChannel, 153); 
}



void readLidarData(LidarState* data) {
    if (IS_OK(lidar.waitPoint())) { 
        RPLidarMeasurement point  = lidar.getCurrentPoint();
        float distance = point.distance;
        float angle = point.angle;
        byte quality = point.quality;
        bool startBit = point.startBit;
        if(startBit){
            unsigned long currentTime = millis();
            // Print time taken since last scan (scan duration)
            if (lastScanTime > 0) {
                Serial.print("Scan duration (ms): ");
                Serial.println(currentTime - lastScanTime);
            }
            lastScanTime = currentTime;
            if (data->collectingScan && pointCount > 0) {
                float averagedDistances[NUM_BUCKETS];
                int readingsPerbucket[NUM_BUCKETS];
                 averageDistances(scanPoints, pointCount, averagedDistances,readingsPerbucket);
                detectAndUpdateObstacles(averagedDistances,readingsPerbucket,data);
              
            }
             data->fullScanForProcessing = true;
            pointCount = 0;
            data->collectingScan = true;
        }


            if (data->collectingScan && distance != 0 && quality > 0 && distance <= 2000) {
                if (pointCount < MAX_POINTS) {
                    scanPoints[pointCount++] = {angle, distance};
                }
            }
     
    
    }
    
}

void averageDistances(const Point* measurements, int size, float* output, int* countOut) {
    float sumDistances[NUM_BUCKETS] = {0};
    int countDistances[NUM_BUCKETS] = {0};

    for (int i = 0; i < size; i++) {
        int bucket = (int)(measurements[i].angle / ANGLE_BUCKET_SIZE);
        sumDistances[bucket] += measurements[i].distance;
        countDistances[bucket]++;
    }

    for (int i = 0; i < NUM_BUCKETS; i++) {
        if (countDistances[i] > 0) {
            output[i] = sumDistances[i] / countDistances[i];
        } else {
            output[i] = -1;
        }
        countOut[i] = countDistances[i];
    }
}


void updateAndDetectObstacles(){
    
}






void detectAndUpdateObstacles(float* averageDistances, int* countDistances, LidarState* lidar) {
    Obstacle obstaclesTemp[NUM_BUCKETS];
    int tempCount = 0;
    int i = 0;


    // process the average distances into similar object bassed on distance and gap between buckets
    while (i < NUM_BUCKETS) {
        if (averageDistances[i] < 0) {
            i++;
            continue;
        }

        float startAngle = i * ANGLE_BUCKET_SIZE;
        float sumDist = averageDistances[i];
        int count = 1;
        int j = i + 1;

        while (j < NUM_BUCKETS &&
               averageDistances[j] >= 0 &&
               countDistances[j] >= 2 &&
               fabs(averageDistances[j] - averageDistances[j - 1]) < SIMILARITY_TOLERANCE &&
               j == i + count) {
            sumDist += averageDistances[j];
            count++;
            j++;
        }

        float endAngle = (j - 1) * ANGLE_BUCKET_SIZE;
        if (startAngle == endAngle) {
    endAngle += ANGLE_BUCKET_SIZE;
}
        float avgDist = sumDist / count;
        float angleSpan = endAngle - startAngle;

        Obstacle candidate = { startAngle, endAngle, avgDist };

        if ((angleSpan >= MIN_OBJECT_WIDTH_DEG || isPersistentObstacle(candidate, lidar)) &&
            tempCount < NUM_BUCKETS) {
            obstaclesTemp[tempCount++] = candidate;
        }

        i = j;
    }

    // builds the obtacles from the sparse buckets where we collect the reading points
    //alows a tolerence of 7 degrees
    Obstacle merged[NUM_BUCKETS];
    int mergedCount = 0;

    for (int i = 0; i < tempCount; i++) {
        Obstacle& newObs = obstaclesTemp[i];
        bool mergedExisting = false;

        for (int j = 0; j < mergedCount; j++) {
            Obstacle& existing = merged[j];

            bool angleClose = !(newObs.endAngle < existing.startAngle - MERGE_ANGLE_TOLERANCE ||
                                newObs.startAngle > existing.endAngle + MERGE_ANGLE_TOLERANCE);
            bool distanceClose = fabs(existing.distance - newObs.distance) < SIMILARITY_TOLERANCE;

            if (angleClose && distanceClose) {
                float width1 = existing.endAngle - existing.startAngle;
                float width2 = newObs.endAngle - newObs.startAngle;
                float totalWidth = width1 + width2;

                existing.startAngle = min(existing.startAngle, newObs.startAngle);
                existing.endAngle = max(existing.endAngle, newObs.endAngle);
                existing.distance = (existing.distance * width1 + newObs.distance * width2) / totalWidth;

                mergedExisting = true;
                break;
            }
        }

        if (!mergedExisting && mergedCount < NUM_BUCKETS) {
            merged[mergedCount++] = newObs;
        }
    }


    Obstacle* writeBuffer = lidar->obstacleBuffers[lidar->activeBufferIndex];
int& writeCount = lidar->obstacleCounts[lidar->activeBufferIndex];

// Fill the buffer as usual:
writeCount = min(mergedCount, NUM_BUCKETS);
for (int i = 0; i < writeCount; i++) {
    writeBuffer[i] = merged[i];
}
    // Save to LidarState the current identified obstacles for processing, and send obstacle detection messgaes to the client 
    //lidar->currentObstaclesCount = min(mergedCount,NUM_BUCKETS);
    // for (int i = 0; i < lidar->currentObstaclesCount; i++) {
    //     lidar->obstacles[i] = merged[i];
    // }

    // Saves the obsacles in a histyory buffer that is a 2d array, that according to the datasheet shuold be 5 reads/second 
    int historySlot = lidar->historyIndex % MAX_HISTORY;
    lidar->historyCounts[historySlot] = lidar->currentObstaclesCount;
   
    for (int i = 0; i < lidar->currentObstaclesCount; i++) {
        lidar->history[historySlot][i] = lidar->obstacles[i];
    }
    lidar->historyIndex = (lidar->historyIndex + 1) % MAX_HISTORY;
}
 


//Check if an object is persistent across 5 scans, with a tolerance of 5 degress between readings  
bool isPersistentObstacle(const Obstacle& candidate, const LidarState* lidar) {
    int matches = 0;
    for (int h = 0; h < MAX_HISTORY; h++) {
        int idx = (lidar->historyIndex - h - 1 + MAX_HISTORY) % MAX_HISTORY;
        int count = lidar->historyCounts[idx];
        for (int i = 0; i < count; i++) {
            const Obstacle& past = lidar->history[idx][i];
            bool angleMatch = fabs(past.startAngle - candidate.startAngle) < 5.0f &&
                              fabs(past.endAngle - candidate.endAngle) < 5.0f;

            if (angleMatch) {
                matches++;
                break;  
            }
        }
    }

    return matches >= 2;  
}


String getDirectionForAngle(float angle) {
  if (angle >= 315 || angle <= 45) {
      return FT; 
  } else if (angle > 45 && angle <= 135) {
      return RT; 
  } else if (angle > 135 && angle <= 225) {
      return BK; 
  } else {
      return LT;
  }
}
