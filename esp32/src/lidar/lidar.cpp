#include "lidar.h"

RPLidar lidar;
HardwareSerial LidarSerial(2);
Obstacle obstacles[20];

Point* scanPoints = nullptr;     
int pointCount = 0;              
bool collectingScan = false;
int obstacleCount = 0;

void initializeHardware() {
    Serial.begin(115200);  
    delay(1000);           // Wait for serial monitor
  
    // Setup LED pins
    pinMode(yellow, OUTPUT);
    pinMode(red, OUTPUT);
    pinMode(green, OUTPUT);
    pinMode(blue, OUTPUT);
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
        Serial.println();
      
        lidar.startScan();
        startMotor();
    } else {
        Serial.println("RPLIDAR not detected!");
    }
}

void startMotor() {
    ledcSetup(pwmChannel, pwmFreq, pwmResolution);
    ledcAttachPin(RPLIDAR_MOTOR, pwmChannel);
    ledcWrite(pwmChannel, 153);  
}

void lightLed(float angle, float dist) {
    if ((angle >= 315 && angle <= 360) || (angle >= 0 && angle <= 45)) {
        digitalWrite(red, HIGH);
        digitalWrite(green, LOW);
        digitalWrite(yellow, LOW);
        digitalWrite(blue, LOW);
    }
    else if (angle > 45 && angle <= 135) {
        digitalWrite(green, LOW);
        digitalWrite(red, LOW);
        digitalWrite(yellow, HIGH);
        digitalWrite(blue, LOW);
    }
    else if (angle > 135 && angle <= 205) {
        digitalWrite(red, LOW);
        digitalWrite(green, HIGH);
        digitalWrite(yellow, LOW);
        digitalWrite(blue, LOW);
    }
    else if (angle > 205 && angle < 315) {
        digitalWrite(red, LOW);
        digitalWrite(green, LOW);
        digitalWrite(yellow, LOW);
        digitalWrite(blue, HIGH);
    }
}

void readLidarData() {
    if (IS_OK(lidar.waitPoint())) {
        float distance = lidar.getCurrentPoint().distance;
        float angle    = lidar.getCurrentPoint().angle;
        bool startBit = lidar.getCurrentPoint().startBit;
        byte quality = lidar.getCurrentPoint().quality;

        if (startBit) {
            Serial.println("Starting new scan...");
            if (collectingScan && pointCount > 0) {
                float averagedDistances[NUM_BUCKETS];
                averageDistances(scanPoints, pointCount, averagedDistances);
                detectObstacles(averagedDistances);
                printObstacles(obstacles, obstacleCount);
                collectingScan = false;
            }

            pointCount = 0;
            collectingScan = true;
        }

        if (collectingScan && distance != 0 && quality > 0 && distance <= 2000) {
            if (pointCount < MAX_POINTS) {
                scanPoints[pointCount].angle = angle;
                scanPoints[pointCount].distance = distance;
                pointCount++;
            } else {
                Serial.println("Reached max points! Ignoring extra points.");
            }

            Serial.printf("A: %.1f° D: %.1f mm Q: %d\n", angle, distance, quality);
            lightLed(angle, distance);
        }
    } else {
        digitalWrite(RPLIDAR_MOTOR, 0);
        rplidar_response_device_info_t info;
        if (IS_OK(lidar.getDeviceInfo(info, 100))) {
            lidar.startScan();
            startMotor();
            delay(1000);
        } else {
            Serial.println("Waiting for LIDAR...");
        }
        collectingScan = false;
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

void detectObstacles(float* averageDistances) {
    obstacleCount = 0;
    int consecutive = 0;
    int startIdx = -1;
    float sumDistances = 0;
    int numDistances = 0;

    for (int i = 0; i < NUM_BUCKETS; i++) {
        int next = (i + 1) % NUM_BUCKETS;

        if (averageDistances[i] > 0 && averageDistances[next] > 0) {
            float diff = fabs(averageDistances[i] - averageDistances[next]);

            if (diff < SIMILARITY_TOLERANCE) {
                if (consecutive == 0) {
                    startIdx = i;
                    sumDistances = 0;
                    numDistances = 0;
                }

                consecutive++;
                sumDistances += averageDistances[i];
                numDistances++;
            } else {
                if (consecutive >= MIN_CONSECUTIVE_BUCKETS && obstacleCount < 20) {
                    Obstacle obs;
                    obs.startAngle = startIdx * ANGLE_BUCKET_SIZE;
                    obs.endAngle = i * ANGLE_BUCKET_SIZE;
                    obs.distance = sumDistances / numDistances;
                    obstacles[obstacleCount++] = obs;
                }
                consecutive = 0;
            }
        } else {
            consecutive = 0;
        }
    }

    if (consecutive >= MIN_CONSECUTIVE_BUCKETS && obstacleCount < 20) {
        Obstacle obs;
        obs.startAngle = startIdx * ANGLE_BUCKET_SIZE;
        obs.endAngle = (NUM_BUCKETS - 1) * ANGLE_BUCKET_SIZE;
        obs.distance = sumDistances / numDistances;
        obstacles[obstacleCount++] = obs;
    }
}

float chordLength(float radius_mm, float angle_deg) {
    float angle_rad = radians(angle_deg);
    return 2 * radius_mm * sin(angle_rad / 2);
}

void printObstacles(const Obstacle* obstacles, int obstacleCount) {
    Serial.println("Detected Obstacles:");
    for (int i = 0; i < obstacleCount; i++) {
        Serial.print("Obstacle ");
        Serial.print(i);
        Serial.print(": Start ");
        Serial.print(obstacles[i].startAngle);
        Serial.print("°, End ");
        Serial.print(obstacles[i].endAngle);
        Serial.print("°, Distance ");
        Serial.print(obstacles[i].distance, 1);
        Serial.println(" mm");
    }
}
