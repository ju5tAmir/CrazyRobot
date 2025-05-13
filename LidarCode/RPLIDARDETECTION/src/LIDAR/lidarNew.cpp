#include "lidar.h"
#include "./models/models.h"

RPLidar lidar;
HardwareSerial LidarSerial(2);
float lastScanTime = 0;

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
                float readingsPerbucket[NUM_BUCKETS];
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
