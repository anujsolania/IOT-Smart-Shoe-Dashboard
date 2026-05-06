/*
=========================================
SMART SHOE FINAL ESP32 CODE
INTEGRATED WITH MERN DASHBOARD
=========================================
*/

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPSPlus.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ================= WIFI & BACKEND =================
// 1. FILL THESE THREE LINES:
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
// 2. Replace YOUR_SERVER_IP with your computer's IP address
const char* serverUrl = "http://YOUR_SERVER_IP:5001/api/device/data";

const String deviceId = "shoe_001";

// ================= PINS =================
#define trigPin 5
#define echoPin 18
#define BUZ 26
#define VIB 25
#define GREEN_LED 27
#define RED_LED 14
#define rainPin 34
#define GPS_RX 16
#define GPS_TX 17
#define GPS_BAUD 9600

// ================= OBJECTS =================
Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// ================= VARIABLES =================
long duration;
long distance;
bool fallMode = false;
unsigned long lastSendTime = 0;
const int sendInterval = 2000; // Update dashboard every 2 seconds

// ================= HELPER FUNCTIONS =================
bool mpuPresent() {
  Wire.beginTransmission(0x68);
  return (Wire.endTransmission() == 0);
}

void sendDataToDashboard(String status, bool isFall) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    JsonDocument doc; // ArduinoJson v7

    doc["deviceId"] = deviceId;
    doc["distance"] = distance;
    doc["rain"] = analogRead(rainPin);
    
    doc["acceleration"]["x"] = a.acceleration.x;
    doc["acceleration"]["y"] = a.acceleration.y;
    doc["acceleration"]["z"] = a.acceleration.z;

    doc["fallDetected"] = isFall;
    doc["obstacleDetected"] = (distance > 0 && distance < 25);
    
    if (gps.location.isValid()) {
      doc["gps"]["lat"] = gps.location.lat();
      doc["gps"]["lng"] = gps.location.lng();
    } else {
      doc["gps"]["lat"] = 28.7041; 
      doc["gps"]["lng"] = 77.1025;
    }
    
    doc["status"] = status;

    String jsonStr;
    serializeJson(doc, jsonStr);

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonStr);
    http.end();
    
    Serial.print("Update Sent. Code: ");
    Serial.println(httpResponseCode);
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found");
  }

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(BUZ, OUTPUT);
  pinMode(VIB, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

// ================= MAIN LOOP =================
void loop() {
  // 1. HANDLE FALL EMERGENCY
  if (fallMode) {
    Serial.println("!!! FALL MODE ACTIVE !!!");
    while (true) {
      digitalWrite(BUZ, HIGH);
      digitalWrite(VIB, HIGH);
      digitalWrite(RED_LED, HIGH);

      while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
      }

      // Keep updating dashboard with emergency location
      if (millis() - lastSendTime > 3000) {
        sendDataToDashboard("fallen", true);
        lastSendTime = millis();
      }
      delay(100);
    }
  }

  // 2. READ SENSORS
  bool mpuConnected = mpuPresent();
  if (mpuConnected) {
    mpu.getEvent(&a, &g, &temp);
  }

  // Ultrasonic distance
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH, 30000);
  distance = (duration == 0) ? 999 : duration / 58.2;

  // Rain
  int rainValue = analogRead(rainPin);

  // 3. CHECK FOR FALLS
  if (mpuConnected && (abs(a.acceleration.x) > 8 || abs(a.acceleration.y) > 8 || a.acceleration.z < 4)) {
    Serial.println("FALL DETECTED");
    fallMode = true;
    sendDataToDashboard("fallen", true);
    return;
  }

  // 4. LOCAL ALERTS (BUZZER/LED)
  String currentStatus = "standing";
  if (distance > 0 && distance < 15) {
    currentStatus = "walking";
    Serial.println("Obstacle Alert");
    digitalWrite(GREEN_LED, LOW);
    for (int i = 0; i < 5; i++) {
      digitalWrite(BUZ, HIGH); digitalWrite(VIB, HIGH); digitalWrite(RED_LED, HIGH);
      delay(50);
      digitalWrite(BUZ, LOW); digitalWrite(VIB, LOW); digitalWrite(RED_LED, LOW);
      delay(50);
    }
  } else if (rainValue < 500 && rainValue > 0) {
    Serial.println("Rain Alert");
    digitalWrite(BUZ, HIGH); delay(300); digitalWrite(BUZ, LOW);
  } else {
    digitalWrite(BUZ, LOW); digitalWrite(VIB, LOW);
    digitalWrite(RED_LED, LOW); digitalWrite(GREEN_LED, HIGH);
  }

  // 5. PERIODIC DASHBOARD UPDATE
  if (millis() - lastSendTime > sendInterval) {
    sendDataToDashboard(currentStatus, false);
    lastSendTime = millis();
  }

  delay(100);
}
