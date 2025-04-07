// /* Integrated with obstacle "trust" system */
// #include "lidar.h"

// RPLidar lidar;
// HardwareSerial LidarSerial(2);
// Obstacle obstacles[20];
// Gap gaps[10];
// int gapCount = 0;

// Point* scanPoints = nullptr;     
// int pointCount = 0;              
// bool collectingScan = false;
// int obstacleCount = 0;

// // --- Settings ---
// const int TRUST_THRESHOLD = 3; // Minimum trust to consider real obstacle
// const int TRUST_DECAY_INTERVAL = 5; // Every 5 scans, decay trust
// int scanCounter = 0; // Counts how many scans happened

// void initializeHardware() {
//     Serial.begin(115200);
//     delay(1000);

//     pinMode(yellow, OUTPUT);
//     pinMode(red, OUTPUT);
//     pinMode(green, OUTPUT);
//     pinMode(blue, OUTPUT);
//     pinMode(RPLIDAR_MOTOR, OUTPUT);

//     LidarSerial.begin(115200, SERIAL_8N1, RPLIDAR_RX, RPLIDAR_TX);
//     lidar.begin(LidarSerial);

//     scanPoints = (Point*) malloc(MAX_POINTS * sizeof(Point));
//     if (!scanPoints) {
//         Serial.println("Failed to allocate memory for scanPoints!");
//         while (true);
//     }

//     rplidar_response_device_info_t info;
//     if (IS_OK(lidar.getDeviceInfo(info, 1000))) {
//         Serial.println("RPLIDAR detected.");
//         lidar.startScan();
//         startMotor();
//     } else {
//         Serial.println("RPLIDAR not detected!");
//     }
// }

// void startMotor() {
//     ledcSetup(pwmChannel, pwmFreq, pwmResolution);
//     ledcAttachPin(RPLIDAR_MOTOR, pwmChannel);
//     ledcWrite(pwmChannel, 153);
// }

// void lightLed(float angle, float dist) {
//     // (Same light LED code as before)
// }

// void readLidarData() {
//     if (IS_OK(lidar.waitPoint())) {
//         float distance = lidar.getCurrentPoint().distance;
//         float angle = lidar.getCurrentPoint().angle;
//         bool startBit = lidar.getCurrentPoint().startBit;
//         byte quality = lidar.getCurrentPoint().quality;

//         if (startBit) {
//             Serial.println("Starting new scan...");
//             if (collectingScan && pointCount > 0) {
//                 float averagedDistances[NUM_BUCKETS];
//                 averageDistances(scanPoints, pointCount, averagedDistances);
//                 detectAndUpdateObstacles(averagedDistances);

//                 if (++scanCounter % TRUST_DECAY_INTERVAL == 0) {
//                     decayTrust();
//                 }

//                 printObstacles();
//                 int direction = getGap();
//                 if (direction != -1) {
//                     Serial.print("Navigate towards: ");
//                     Serial.println(direction);
//                 }

//                 collectingScan = false;
//             }
//             pointCount = 0;
//             collectingScan = true;
//         }

//         if (collectingScan && distance != 0 && quality > 0 && distance <= 2000) {
//             if (pointCount < MAX_POINTS) {
//                 scanPoints[pointCount++] = {angle, distance};
//             }
//         }
//     }
// }

// void averageDistances(const Point* measurements, int size, float* output) {
//     // (Same averageDistances function)
// }

// void detectAndUpdateObstacles(float* averageDistances) {
//     for (int i = 0; i < NUM_BUCKETS; i++) {
//         if (averageDistances[i] < 0) continue;

//         int next = (i + 1) % NUM_BUCKETS;
//         if (averageDistances[next] < 0) continue;

//         if (fabs(averageDistances[i] - averageDistances[next]) < SIMILARITY_TOLERANCE) {
//             float newStart = i * ANGLE_BUCKET_SIZE;
//             float newEnd = next * ANGLE_BUCKET_SIZE;
//             float newDistance = (averageDistances[i] + averageDistances[next]) / 2;

//             bool matched = false;
//             for (int j = 0; j < obstacleCount; j++) {
//                 if (abs(obstacles[j].startAngle - newStart) < 10 && abs(obstacles[j].endAngle - newEnd) < 10) {
//                     obstacles[j].startAngle = (obstacles[j].startAngle + newStart) / 2;
//                     obstacles[j].endAngle = (obstacles[j].endAngle + newEnd) / 2;
//                     obstacles[j].distance = (obstacles[j].distance + newDistance) / 2;
//                     obstacles[j].trust++;
//                     matched = true;
//                     break;
//                 }
//             }

//             if (!matched && obstacleCount < 20) {
//                 obstacles[obstacleCount++] = {newStart, newEnd, newDistance, 1};
//             }
//         }
//     }
// }

// void decayTrust() {
//     for (int i = 0; i < obstacleCount; i++) {
//         if (obstacles[i].trust > 0) obstacles[i].trust--;
//     }
// }

// void printObstacles() {
//     Serial.println("Confirmed Obstacles:");
//     for (int i = 0; i < obstacleCount; i++) {
//         if (obstacles[i].trust >= TRUST_THRESHOLD) {
//             Serial.printf("[%d] %.1f-%.1f degrees, Dist: %.1fmm, Trust: %d\n",
//                           i, obstacles[i].startAngle, obstacles[i].endAngle,
//                           obstacles[i].distance, obstacles[i].trust);
//         }
//     }
// }

// int getGap() {
//     findGaps(15);

//     int bestGap = -1;
//     int bestScore = 9999;
//     for (int i = 0; i < gapCount; i++) {
//         int center = (gaps[i].startAngle + gaps[i].endAngle) / 2;
//         int deviation = abs(center - 0);
//         if (deviation < bestScore) {
//             bestScore = deviation;
//             bestGap = center;
//         }
//     }
//     return bestGap;
// }

// void findGaps(int minWidth) {
//     gapCount = 0;
//     for (int i = 0; i < obstacleCount - 1; i++) {
//         if (obstacles[i].trust < TRUST_THRESHOLD) continue;

//         int gapStart = obstacles[i].endAngle;
//         int gapEnd = obstacles[i + 1].startAngle;
//         int width = gapEnd - gapStart;
//         if (width > minWidth) {
//             gaps[gapCount++] = {gapStart, gapEnd, width};
//         }
//     }
// }
