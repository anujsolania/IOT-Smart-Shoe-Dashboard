/*
=========================================
SMART SHOE - FINAL SIMPLIFIED LOGIC
RED/GREEN STATUS | GOOGLE MAPS READY
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
bool motorActive = false; 
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
  Serial.println("\nWiFi Connected! Simplified Logic Ready.");
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
    doc["status"] = status; // RED or GREEN

    String jsonStr; serializeJson(doc, jsonStr);
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.POST(jsonStr);
    http.end();
  }
}

void loop() {
  // Update GPS
  while (gpsSerial.available() > 0) gps.encode(gpsSerial.read());
  if (gps.location.isValid()) { latestLat = gps.location.lat(); latestLng = gps.location.lng(); }

  // Check Fall
  Wire.beginTransmission(0x68);
  if (Wire.endTransmission() == 0) {
    mpu.getEvent(&a, &g, &temp);
    if (abs(a.acceleration.x) > 6 || abs(a.acceleration.y) > 6 || (a.acceleration.z > 1 && a.acceleration.z < 6)) {
      if (!fallDetectedFlag) { 
        Serial.println("\nFALL DETECTED"); 
        Serial.println("VIBRATION ON"); 
        fallDetectedFlag = true; 
        sendData("RED", true);
      }
    } else { fallDetectedFlag = false; }
  }

  // Ultrasonic
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long dur = pulseIn(echoPin, HIGH, 20000);
  distance = (dur == 0) ? 999 : dur / 58.2;

  // Alerts & Vibration
  if ((distance > 0 && distance < 15) || fallDetectedFlag) {
    digitalWrite(VIB, HIGH);
    if (!motorActive) {
      if (distance < 15 && distance > 0) Serial.println("\nOBJECT DETECTED");
      Serial.println("VIBRATION ON");
      motorActive = true;
    }
  } else {
    digitalWrite(VIB, LOW);
    motorActive = false;
  }

  // Periodic Update (Status logic)
  if (millis() - lastDashboardUpdate > 2000) {
    String currentStatus = (motorActive || fallDetectedFlag) ? "RED" : "GREEN";
    sendData(currentStatus, fallDetectedFlag);
    lastDashboardUpdate = millis();
  }
  delay(30);
}
