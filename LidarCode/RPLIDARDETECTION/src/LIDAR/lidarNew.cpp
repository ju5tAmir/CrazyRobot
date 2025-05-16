#include "lidar.h"
#include "./models/models.h"
#include "../commands/commands.h"

RPLidar lidar;
HardwareSerial LidarSerial(2);
const int MIN_OBJECT_WIDTH_DEG = 3;
Point* scanPoints = nullptr;     

int pointCount = 0;              
    int counter=0;
        int startBitC = 0;

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
    
    lidarState.collectingScan = false;
    pointCount = 0;  
    
    // Initialize buffer indices
    lidarState.activeBufferIndex = 0;
    lidarState.fullScanForProcessing = false;
    
    Serial.println("LIDAR scan started successfully.");
    return true;
}

// Stop the lidar 
bool stopLidar(LidarState &lidarState) {
    lidar.stop();
    ledcWrite(pwmChannel, 0);
    lidarState.collectingScan = false;
    lidarState.fullScanForProcessing = false;
    pointCount = 0; 
       if (scanPoints != nullptr) {
        free(scanPoints);
        scanPoints = nullptr;
    }
    Serial.println("LIDAR motor stopped.");
    return true;
}

// Start the motor of the lidar 
void startMotor() {
    ledcSetup(pwmChannel, pwmFreq, pwmResolution);
    ledcAttachPin(RPLIDAR_MOTOR, pwmChannel);
    ledcWrite(pwmChannel, 160); 
    Serial.println("LIDAR motor started.");
}

void readLidarData(LidarState* data) {
  pointCount = 0;
  data->collectingScan = false;
  bool scanStarted = false;

  unsigned long scanStartTime = millis();
  const unsigned long maxScanDuration = 500; 
  int counter=0;

  while (millis() - scanStartTime < maxScanDuration) {
    if (!IS_OK(lidar.waitPoint())) {
      delay(1);
      continue;
    }
    counter ++;
    RPLidarMeasurement point = lidar.getCurrentPoint();
    float distance = point.distance;
    float angle = point.angle;
    byte quality = point.quality;
    bool startBit = point.startBit;

    if (startBit) {
      if (scanStarted && pointCount > 0) {
        float averagedDistances[NUM_BUCKETS];
        int readingsPerbucket[NUM_BUCKETS];
        averageDistances(scanPoints, pointCount, averagedDistances, readingsPerbucket);
        detectAndUpdateObstacles(averagedDistances, readingsPerbucket, data);
        data->fullScanForProcessing = true;
        return;  
      }

      scanStarted = true;
      pointCount = 0;
    }

    if (scanStarted && distance > 0 && quality > 0 && distance <= 2000 && pointCount < MAX_POINTS) {
      scanPoints[pointCount++] = { angle, distance };
    }
  }

  data->fullScanForProcessing = false;
  //flush the serial buffer if the collection fails by not geting a start
 // bit or time allocated for reading expires
  unsigned long flushStart = millis();
  while (millis() - flushStart < 100) {
  if (!IS_OK(lidar.waitPoint())) break;
  lidar.getCurrentPoint(); 
}
}

void averageDistances(const Point* measurements, int size, float* output, int* countOut) {
    float sumDistances[NUM_BUCKETS] = {0};
    int countDistances[NUM_BUCKETS] = {0};
    for (int i = 0; i < size; i++) {
        int bucket = (int)(measurements[i].angle / ANGLE_BUCKET_SIZE);
        if (bucket >= 0 && bucket < NUM_BUCKETS) {  // Bounds check
            sumDistances[bucket] += measurements[i].distance;
            countDistances[bucket]++;
        }
    }

    for (int i = 0; i < NUM_BUCKETS; i++) {
        if (countDistances[i] > 0) {
            output[i] = sumDistances[i] / countDistances[i];
        } else {
            output[i] = -1;  // No data for this bucket
        }
        countOut[i] = countDistances[i];
    }
}


// Helper to dynamically choose group sizes based on distance
const int* getDynamicGroupSizes(float dist, int& sizeOut) {
    static const int nearGroups[] = {2, 3};    // 6°–9° obstacle measurement span
    static const int midGroups[]  = {3, 5};    // 9°–15°  obstacle measurement span
    static const int farGroups[]  = {5, 10};   // 15°–30°  obstacle measurement span

    if (dist < 500.0f) {
        sizeOut = 2;
        return nearGroups;
    } else if (dist < 1500.0f) {
        sizeOut = 2;
        return midGroups;
    } else {
        sizeOut = 2;
        return farGroups;
    }
}




//The one with gaps
void detectAndUpdateObstacles(float* averageDistances, int* countDistances, LidarState* lidar) {
    Obstacle obstaclesTemp[NUM_BUCKETS];
    int tempCount = 0;
    bool used[NUM_BUCKETS] = { false };

    const int MIN_VALID_BUCKETS = 2;
    const int MAX_GAP_IN_GROUP = 1;

    for (int i = 0; i < NUM_BUCKETS; i++) {
        if (averageDistances[i] < 0 || used[i]) continue;

        float refDist = averageDistances[i];
        int groupCount = 0;
        const int* groupSizes = getDynamicGroupSizes(refDist, groupCount);

        for (int g = 0; g < groupCount; g++) {
            int group = groupSizes[g];
            if (i + group > NUM_BUCKETS) continue;

            int valid = 0, gaps = 0;
            float minDist = 10000.0f, maxDist = 0.0f, sum = 0.0f;

            for (int k = 0; k < group; k++) {
                int idx = i + k;
                float d = averageDistances[idx];

                if (d >= 0 && !used[idx]) {
                    minDist = min(minDist, d);
                    maxDist = max(maxDist, d);
                    sum += d;
                    valid++;
                } else {
                    gaps++;
                }
            }

            if (valid >= MIN_VALID_BUCKETS && gaps <= MAX_GAP_IN_GROUP && (maxDist - minDist) <= SIMILARITY_TOLERANCE) {
                float avgDist = sum / valid;
                float startAngle = i * ANGLE_BUCKET_SIZE;
                float endAngle = (i + group) * ANGLE_BUCKET_SIZE;
                float angleSpan = endAngle - startAngle;

                Obstacle candidate = { startAngle, endAngle, avgDist };

                if ((angleSpan >= MIN_OBJECT_WIDTH_DEG || isPersistentObstacle(candidate, lidar)) && tempCount < NUM_BUCKETS) {
                    obstaclesTemp[tempCount++] = candidate;
                }

                for (int k = 0; k < group; k++) used[i + k] = true;
                break;
            }
        }
    }

    // --- Merge overlapping obstacles ---
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
    writeCount = min(mergedCount, NUM_BUCKETS);

    for (int i = 0; i < writeCount; i++) {
        writeBuffer[i] = merged[i];
    }

    int historySlot = lidar->historyIndex % MAX_HISTORY;
    lidar->historyCounts[historySlot] = writeCount;
    for (int i = 0; i < writeCount; i++) {
        lidar->history[historySlot][i] = merged[i];
    }
    lidar->historyIndex = (lidar->historyIndex + 1) % MAX_HISTORY;
}


// Check if an object is persistent across scans, with a tolerance of 5 degrees between readings  
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


