#include "ServoDefinitions.h"

ServoData servos[SERVO_COUNT] = {
  //  ID   INIT  MIN   MAX   ANG  TAR  STP   GSTP STPS  DIR   INT   PRV   IMV
  {   0,   90,   30,   150,  90,   90,   1,   5,   1,    1,   20,    0,  false},
  {   1,   40,   10,   180,  40,    1,   1,  10,   1,    1,   20,    0,  false},
  {   2,   30,   30,   180,  30,   90,   1,  10,   1,    1,   20,    0,  false},
  {   3,  125,   85,   135, 125,   90,   1,   5,   1,    1,   10,    0,  false},
  {   4,   80,   70,   120,  80,   90,   1,   5,   1,    1,   10,    0,  false},
  {   5,  160,   80,   170, 150,   90,   1,   5,   1,    1,   10,    0,  false},
  {   6,   80,   60,   160,  90,   90,   1,   5,   1,    1,   10,    0,  false}
};
