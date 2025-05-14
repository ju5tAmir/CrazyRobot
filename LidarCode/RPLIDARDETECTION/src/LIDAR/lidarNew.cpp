#include "lidar.h"
#include "./models/models.h"

RPLidar lidar;
HardwareSerial LidarSerial(2);
float lastScanTime = 0;

const int MIN_OBJECT_WIDTH_DEG=3;
Point* scanPoints = nullptr;     

int pointCount = 0;              
bool collectingScan = false;

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
            if (collectingScan && pointCount > 0) {
                float averagedDistances[NUM_BUCKETS];
                int readingsPerbucket[NUM_BUCKETS];
                 averageDistances(scanPoints, pointCount, averagedDistances,readingsPerbucket);
                detectAndUpdateObstacles(averagedDistances,readingsPerbucket,data);
                     
            //     Serial.println("A new scan has started");
            //         for (int i = 0; i < pointCount; i++) {
            //               Serial.println("start point");
            //            Serial.println(scanPoints[i].angle);
            //             Serial.println(scanPoints[i].distance);
            //                 Serial.println("end point");
            //          }
            //   Serial.println("Previous scan processed  ");
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
    


while (i < NUM_BUCKETS) {
    // if no readings skip the bucket
    if (averageDistances[i] < 0) {
        i++;
        continue;
    }

    float startAngle = i * ANGLE_BUCKET_SIZE;
    float sumDist = averageDistances[i];
    int count = 1;
    int j = i + 1;

    // Group adjacent, similar-distance, continuous-angle buckets, and similar angles 
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
    float avgDist = sumDist / count;
    float angleSpan = endAngle - startAngle;

    // Filter out narrow noise
    if (angleSpan >= MIN_OBJECT_WIDTH_DEG && tempCount < NUM_BUCKETS) {
        obstaclesTemp[tempCount++] = { startAngle, endAngle, avgDist };
    }

    i = j;
}
for (int i=0;i<tempCount;i++)
{
   Obstacle obs = obstaclesTemp[i]; 
    Serial.println("New object ");
    Serial.println(obs.startAngle);
    Serial.println(obs.endAngle);
    Serial.println(obs.distance);
   Serial.println("End object ");

}

}
