#include "lidar.h"
#include "./models/models.h"
RPLidar lidar;
HardwareSerial LidarSerial(2);
SemaphoreHandle_t robotMutex = xSemaphoreCreateMutex();
Gap gaps[10];
int gapCount = 0;

Point* scanPoints = nullptr;     

int pointCount = 0;              
bool collectingScan = false;
// const String directions[4] = {FT, BK, LT, RT};
// String warnings[4] = {FREE, FREE, FREE, FREE};
// String lastWarnings[4] = {FREE, FREE, FREE, FREE};
// int directionIndex(const String direction) {
//     if (direction == FT) return 0;
//     if (direction==BK) return 1;
//     if (direction==LT) return 2;
//     if (direction==RT) return 3;
//     return -1;
//   }
  bool scanComplete=false;
  float lastScanTime = 0;

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


//Stop the lidar 
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
            if (collectingScan && pointCount > 0) {
                // float averagedDistances[NUM_BUCKETS];
                //  averageDistances(scanPoints, pointCount, averagedDistances);
                // detectAndUpdateObstacles(averagedDistances,data);
                     
                Serial.println("A new scan has started");
                    for (int i = 0; i < pointCount; i++) {
                          Serial.println("start point");
                       Serial.println(scanPoints[i].angle);
                        Serial.println(scanPoints[i].distance);
                            Serial.println("end point");
                     }
              Serial.println("Previous scan processed  ");
            }
            pointCount = 0;
            collectingScan = true;
        }


            if (collectingScan && distance != 0 && quality > 0 && distance <= 2000) {
                if (pointCount < MAX_POINTS) {
                    scanPoints[pointCount++] = {angle, distance};
                }
            }
     
    
    }
    
}



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


    if (xSemaphoreTake(robotMutex, pdMS_TO_TICKS(50))) {
        // for (int i = 0; i < NUM_BUCKETS; i++) {
        //     robot->previousObstacles[i] = robot->obstacles[i];
        // }
        for (int i = 0; i < mergedCount; i++) {
            robot->obstacles[i] = merged[i];
        }
        robot->currentObstaclesCount=mergedCount;
        xSemaphoreGive(robotMutex);
    }

    // Serial.println("<<<<<<<<Obstacles found >>>>>>>>>>>" );
    // Serial.println(mergedCount);
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











  
  

