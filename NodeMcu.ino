#include <ESP8266WiFi.h>
#include "HTTPSRedirect.h"
#include <IRremoteESP8266.h>
#include <IRsend.h>
#include <ir_Fujitsu.h>

#include <DHT.h>
#include "./esppl_functions.h"

/* Serial Baud Rate */
#define SERIAL_BAUD       115200
/* Delay paramter for connection. */
#define WIFI_DELAY        500
/* Max SSID octets. */
#define MAX_SSID_LEN      32
/* Wait this much until device gets IP. */
#define MAX_CONNECT_TIME  30000

/* SSID that to be stored to connect. */
char ssid[MAX_SSID_LEN] = "";


#define DHTPIN D1                                                           // what digital pin we're connected to
#define DHTTYPE DHT11                                                       // select dht type as DHT 11 or DHT22
DHT dht(DHTPIN, DHTTYPE);

const uint16_t kIrLed = D8;  // ESP8266 GPIO pin to use. Recommended: 4 (D2).
IRFujitsuAC ac(kIrLed);  // Set the GPIO used for sending messages.
IRsend irsend(kIrLed);

bool flag = false;
//int personflag=0;
float h;
float t;
//unsigned long previousMillis = 0;
//unsigned long interval = 50000;
String sheetHumid = "";
String sheetTemp = "";
String NewOrder = "";

#define LIST_SIZE 1

const char* host = "script.google.com";
const int httpsPort = 443;
const char *GScriptId = "*******_********-*******_**********_*******-*************";

// Write to Google Spreadsheet
String url = String("/macros/s/") + GScriptId + "/exec?tem=";
String payload = "";

HTTPSRedirect* client = nullptr;

void scanAndSort() {
  memset(ssid, 0, MAX_SSID_LEN);
  int n = WiFi.scanNetworks();
  Serial.println("Scan complete!");
  if (n == 0) {
    Serial.println("No networks available.");
  } else {
    Serial.print(n);
    Serial.println(" networks discovered.");
    int indices[n];
    for (int i = 0; i < n; i++) {
      indices[i] = i;
    }
    for (int i = 0; i < n; i++) {
      for (int j = i + 1; j < n; j++) {
        if (WiFi.RSSI(indices[j]) > WiFi.RSSI(indices[i])) {
          std::swap(indices[i], indices[j]);
        }
      }
    }
    for (int i = 0; i < n; ++i) {
      Serial.println("The strongest open network is:");
      Serial.print(WiFi.SSID(indices[i]));
      Serial.print(" ");
      Serial.print(WiFi.RSSI(indices[i]));
      Serial.print(" ");
      Serial.print(WiFi.encryptionType(indices[i]));
      Serial.println();
      if(WiFi.encryptionType(indices[i]) == ENC_TYPE_NONE) {
        memset(ssid, 0, MAX_SSID_LEN);
        strncpy(ssid, WiFi.SSID(indices[i]).c_str(), MAX_SSID_LEN);
        break;
      }
    }
  }
}

 
void setup() {
  delay(1000);
  ac.begin();
  irsend.begin();
  Serial.begin(115200);
  //WiFi.persistent(false);
  dht.begin(); 
  
  Serial.print("Connecting to wifi: ");
  //Serial.println(ssid);
  
  //WiFi.begin(ssid);
  //while (WiFi.status() != WL_CONNECTED) {
    //delay(500);
    //Serial.print(".");
  //}
  //Serial.println("");
  //Serial.println("WiFi connected");
  //Serial.println("IP address: ");
  //Serial.println(WiFi.localIP());

  // Use HTTPSRedirect class to create a new TLS connection
  if(WiFi.status() != WL_CONNECTED) {
    /* Clear previous modes. */
    WiFi.softAPdisconnect();
    WiFi.disconnect();
    WiFi.mode(WIFI_STA);
    delay(WIFI_DELAY);
    /* Scan for networks to find open guy. */
    scanAndSort();
    delay(WIFI_DELAY);
    /* Global ssid param need to be filled to connect. */
    if(strlen(ssid) > 0) {
      Serial.print("Connecting to ");
      Serial.println(ssid);
      /* No pass for WiFi. We are looking for non-encrypteds. */
      WiFi.begin(ssid);
      unsigned short try_cnt = 0;
      /* Wait until WiFi connection but do not exceed MAX_CONNECT_TIME */
      while (WiFi.status() != WL_CONNECTED && try_cnt < MAX_CONNECT_TIME / WIFI_DELAY) {
        delay(WIFI_DELAY);
        Serial.print(".");
        try_cnt++;
      }
      if(WiFi.status() == WL_CONNECTED) {
        Serial.println("");
        Serial.println("Connection Successful!");
        Serial.println("Your device IP address is ");
        Serial.println(WiFi.localIP());
      } else {
        Serial.println("Connection FAILED");
      }
    } else {
      Serial.println("No open networks available. :-(");  
    }
  }
  
  client = new HTTPSRedirect(httpsPort);
  client->setInsecure();
  client->setPrintResponseBody(true);
  client->setContentTypeHeader("application/json");
  
  Serial.print("Connecting to ");
  Serial.println(host);

  // Try to connect for a maximum of 5 times
  for (int i=0; i<5; i++){
    int retval = client->connect(host, httpsPort);
    if (retval == 1) {
       flag = true;
       break;
    }
    else
      Serial.println("Connection failed. Retrying...");
  }

  if (!flag){
    Serial.print("Could not connect to server: ");
    Serial.println(host);
    Serial.println("Exiting...");
    return;
  }
  
}

void loop() {

  /*unsigned long currentMillis = millis();
  if ((currentMillis - previousMillis >=interval)) {
     
      delete client;
      client = nullptr;
      flag = false;
      
      esppl_init(cb);
      esppl_sniffing_start();
      
        for (int i = ESPPL_CHANNEL_MIN; i <= ESPPL_CHANNEL_MAX; i++ ) {
          esppl_set_channel(i);
          delay(500);
          while (esppl_process_frames()) {
            if(personflag==1){
              break;        
            }
          }
          if(personflag==1){
              esppl_sniffing_stop();
              wifi_promiscuous_enable(false);
              break;        
            }
        }
          Serial.print("\nOne Loop complete, presence = " );
          Serial.println(personflag);
          personflag=0;
          previousMillis = currentMillis;
          WiFi.begin(ssid, password);
          while (WiFi.status() != WL_CONNECTED){
          delay(500);
          Serial.print(".");
    }
  }*/
  
  t = dht.readTemperature();
  h = dht.readHumidity();
  
  //static int connect_count = 0;
  //static bool flag = false;
  
  
  sheetTemp = String(t);
  sheetHumid = String(h,DEC);
  String FinalStringToSend;
  FinalStringToSend = url + sheetTemp + "&humid=" + sheetHumid + "&room=1";
  
  if (!flag) {
    client = new HTTPSRedirect(httpsPort);
    client->setInsecure();
    flag = true;
    client->setPrintResponseBody(true);
    client->setContentTypeHeader("application/json");
    
  }
  
  if (client != nullptr){
    if (!client->connected()){
      client->connect(host, httpsPort);
      payload= "";
      Serial.println("POST Data to Sheet");
  Serial.println("POST url :" + FinalStringToSend);
  client->POST(FinalStringToSend, host, payload);
    }
  }
  else{
  Serial.println(" >> Failed to POST data");
  }
  Serial.println("GET url :"+FinalStringToSend);
  client->GET(FinalStringToSend, host);
  String NewOrder = client->getResponseBody();
  NewOrder.trim();
  if(NewOrder.substring(0) == "on")
    { 
      Serial.println("turn it on");
      delay(500);
      ac.on();
      ac.setTemp(27);
    
      //Testing send all above configuration
      ac.send();
  
    }
  
  else{
      Serial.println("do nothing");
    }
  delay(7000);
  
                          
}
