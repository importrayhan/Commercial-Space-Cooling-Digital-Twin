# Commercial-Space-Cooling-Digital-Twin
With the nodemcu IoT device, both indoor and outdoor weather data will be collected in the cloud at predetermined intervals. Later, AI pipelines will consume the time-series in order to produce optimum A/C operational control choices based on pattern discovery. nodemcu will simply need a 5V 2A ac adapter to function. The energy usage of the deep sleep mode is insignificant when room is out of use.

# Concept

#### ESP8266 can connect with internet via ESP8266WIFI library. A/C remote sends unique IR signal to the IR receiver of A/C. So, the communication is based on IR signal. Different brand's A/C uses unique sequence of bits for each control signal. The IRremoteESP8266 module contains almost all protocols of the existing A/C. The HTTPSRedirect module can work with REST API. 
#### There are of course many options to choose from as a database. In this project I utilized my Gsuite account and used the Google Sheet as a data storage. The Google Script provided more automation scopes which would have otherwise costed me more on other platforms. Using precise Lat, Long values, the OpenWeather's javascript library could provide accurate weather information of the outdoor environment. 

### Basically, Arduino Libraries and Javascript knowledge is pre-requisite to work with this project.

# SetUp Steps
#### 1. Connect the ESP8266 with Computer 
#### 2. Compile and Upload the .ino code to ESP8266 or Nodemcu
#### 3. Give a Star to this repo while the code is uploading
#### 3. Once your device is ready, keep the device with the IR LED facing the A/C 
#### 4. Create a google sheet and open App Script (You don't need to follow the exact cell names. You can change the code once you know the logic.)
#### 5. Compile .gs code to the App Script Editor
#### 6. If you are having a good day then you don't need to start debugging

## Developed IoT device
#### DHT11 sensor was connected to D1 pin,
#### IR LED was connected to D8 pin of nodemcu v1,
#### 2N3904 IC was required to control the IR LED through pin D8.
![insdp](https://user-images.githubusercontent.com/43013813/182040484-7b43468e-af5f-4022-9adf-d85dd09313ec.png)

![WhatsApp Image 2021-05-16 at 1 03 47 PM](https://user-images.githubusercontent.com/43013813/182039280-fd2d0ec5-36d4-4168-a2be-106f9e45d9c7.jpeg)

## Microcontroller's code module
#### The .ino code searches open wifi and connects automatically on the device startup (The pre-defined wifi name and password is commonly used and can be found online. In real world, my environment had open wifi.).
#### Then the code reads data from DHT11 and send to Google Script's API. 
#### The Google Script can also send data to the microcontroller. 
![image](https://user-images.githubusercontent.com/43013813/182039751-55caac48-9030-4f8a-8490-0db11cd68760.png)

## Google Sheet
![image](https://user-images.githubusercontent.com/43013813/182039202-e0451b60-9b93-4970-b83a-95e6e71f988c.png)
#### Spereate sheet with the office hour and previous data receiving time.
![image](https://user-images.githubusercontent.com/43013813/182040025-3f034570-a82e-4239-b6b4-583ac6796fb7.png)
#### Another sheet with Latitude, Longiture information of the room and A/C information for future use.
![image](https://user-images.githubusercontent.com/43013813/182040166-9d0372fc-b598-432b-b2da-406f53b770db.png)

## Google Script
#### Google Script talks to the Google Sheet and Microcontroller as well. It knows when the office is occupied from given fields.
![image](https://user-images.githubusercontent.com/43013813/182039999-d9fbda40-1ed9-4ab8-8860-10b11d8464f1.png)
#### doget() receives field data from nodemcu and save_data() saves the data with additional openweather's weather data.
![image](https://user-images.githubusercontent.com/43013813/182040095-ff94d1fb-b519-4017-a4af-0915168c7b45.png)


## Future aim
#### The target of this project is to develop a time-series machine learning model that can uncover hidden pattern of the A/C usage behavior. 
![rect833](https://user-images.githubusercontent.com/43013813/182039352-e8d3f413-70cc-44cf-b57b-c49c36c85bf2.png)
#### Moreover, there are scope to apply supervised machine learning to predict future electricity consumption based on current state.
#### Finally, by training a reinforcement machine learning model, the A/C can be controlled with AI agent that will be intended to minimize electricity cost and maximize the comfort level.
