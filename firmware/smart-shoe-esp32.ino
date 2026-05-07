/*
=========================================
SMART SHOE - FIXED LOGIC (v5)
REFINED FALL SENSITIVITY | MAP LINK FIXED
=========================================
*/

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPSPlus.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "iPhone 13 pro";
const char* password = "anujsolania";
const char* serverUrl = "https://supports-downloaded-visibility-dicke.trycloudflare.com/api/device/data";
const String deviceId = "shoe_001";

#define trigPin 5
#define echoPin 18
#define VIB 26 
#define GPS_RX 16
#define GPS_TX 17
#define GPS_BAUD 9600

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

double latestLat = 28.7041; 
double latestLng = 77.1025;
long distance = 999;
bool fallDetectedFlag = false;
bool objectDetectedFlag = false; 
bool motorActive = false;
int fallConfirmationCount = 0; 

unsigned long lastVibTriggerTime = 0;
unsigned long lastDashboardUpdate = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  mpu.begin();
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(VIB, OUTPUT); 
  digitalWrite(VIB, LOW);
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  Serial.println("\nWiFi Connected! Logic V5 Live.");
}

void sendData(String status, bool isFall) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    JsonDocument doc;
    doc["deviceId"] = deviceId;
    doc["distance"] = distance;
    doc["fallDetected"] = isFall;
    doc["gps"]["lat"] = latestLat;
    doc["gps"]["lng"] = latestLng;
    doc["status"] = status;
    String mapLink = "https://www.google.com/maps?q=" + String(latestLat, 6) + "," + String(latestLng, 6);
    doc["mapLink"] = mapLink;
    String jsonStr; serializeJson(doc, jsonStr);
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.POST(jsonStr);
    http.end();
  }
}

void loop() {
  while (gpsSerial.available() > 0) gps.encode(gpsSerial.read());
  if (gps.location.isValid()) { latestLat = gps.location.lat(); latestLng = gps.location.lng(); }

  // 1. REFINED FALL SENSOR (Confirmation required)
  Wire.beginTransmission(0x68);
  if (Wire.endTransmission() == 0) {
    mpu.getEvent(&a, &g, &temp);
    bool thresholdsExceeded = (abs(a.acceleration.x) > 7 || abs(a.acceleration.y) > 7 || (a.acceleration.z > 1 && a.acceleration.z < 5));
    
    if (thresholdsExceeded) {
      fallConfirmationCount++;
      if (fallConfirmationCount >= 5 && !fallDetectedFlag) { 
        Serial.println("\nFALL DETECTED"); 
        fallDetectedFlag = true; 
        sendData("RED", true); 
      }
    } else {
      fallConfirmationCount = 0;
      if (fallDetectedFlag) {
        fallDetectedFlag = false;
        sendData("GREEN", false);
      }
    }
  }

  // 2. OBJECT SENSOR
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long dur = pulseIn(echoPin, HIGH, 20000);
  distance = (dur == 0) ? 999 : dur / 58.2;
  objectDetectedFlag = (distance > 0 && distance < 15);

  // 3. VIBRATION
  if (objectDetectedFlag || fallDetectedFlag) {
    digitalWrite(VIB, HIGH);
    if (!motorActive) { Serial.println("VIBRATION ON"); motorActive = true; }
    lastVibTriggerTime = millis();
  } else {
    if (motorActive && (millis() - lastVibTriggerTime > 200)) {
      digitalWrite(VIB, LOW);
      motorActive = false;
    }
  }

  // 4. PERIODIC DASHBOARD SYNC
  if (millis() - lastDashboardUpdate > 2000) {
    String currentStatus = (objectDetectedFlag || fallDetectedFlag) ? "RED" : "GREEN";
    sendData(currentStatus, fallDetectedFlag);
    lastDashboardUpdate = millis();
  }
  delay(30);
}