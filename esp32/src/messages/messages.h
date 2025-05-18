#include <WString.h>
#include "../models/models.h"
#ifndef MESSAGES_h
#define MESSAGES_h
#define MAX_QUEUE_SIZE 5
extern const char Terminator;
extern const String InitializeError;  
extern const String StopError;
extern const String MILD;
extern const String SEVERE;
extern const String BRAKE; 
extern const String FREE;
extern const String FT;  //front
extern const String BK; //back
extern const String LT ; //left
extern const String RT ; //right
extern const String LidarOn;
extern const String LidarOff;
extern const char frontCommand;
extern const char backCommand ;
extern const char leftCommand ;
extern const char rightCommand ;
extern const char  Mild_Warning ; //mild warning
extern const char Severe_Warning;//severe warning
extern const char Free_warning ;//no obstacles detected


// queue for the lidar messages 
struct MessageQueue {
  LidarMessage data[MAX_QUEUE_SIZE];
  int head = 0;
  int tail = 0;
  int count = 0;

  bool isEmpty() const {
    return count == 0;
  }

  bool isFull() const {
    return count == MAX_QUEUE_SIZE;
  }

  void push(String &msg, unsigned long arrivedTime) {
    if (!isFull()) {
      data[tail] = LidarMessage(msg,arrivedTime);
      Serial.println(data[tail].command);
       Serial.println(data[tail].timestamp);
      tail = (tail + 1) % MAX_QUEUE_SIZE;
      count++;
    }
  }
LidarMessage pop() {
    if (!isEmpty()) {
    LidarMessage msg = data[head];
      head = (head + 1) % MAX_QUEUE_SIZE;
      count--;
      return msg;
    }
    return LidarMessage();
  }

 LidarMessage peek() const {
    if (!isEmpty()) {
      return data[head];
    }
    return LidarMessage();
  }

  void clear() {
    head = tail = count = 0;
  }
};

#endif
