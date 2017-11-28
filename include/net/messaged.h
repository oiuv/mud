// messaged.h

#ifndef __MESSAGE_D__
#define __MESSAGE_D__

// chatter object
#define CHATTER_OB              "/clone/user/chatter"

// item index in connection
#define NAME                    "name"
#define ADDRESS                 "address"
#define GENDER                  "gender"
#define AGE                     "age"
#define FAILED                  "failed"
#define KEEP_ALIVE              "keep_alive"

// item index in info
#define USER                    "user"
#define NAME                    "name"
#define SEQUENCE                "sequence"
#define PASSWORD                "password"
#define FUNCTION                "function"
#define ARG                     "arg"
#define MESSAGE                 "message"
#define MSGTO                   "msgto"
#define ACK                     "ack"
#define MY_SEQ                  "my_seq"
#define ERROR                   "error"
#define ADDITION                "addition"

// item value of function
#define FUN_LOGON               "logon"
#define FUN_VISION              "vision"
#define FUN_TELL                "tell"
#define FUN_ACKTELL             "acktell"
#define FUN_SEND_ENV            "send_env"
#define FUN_NOTICE              "notice"
#define FUN_LOGOUT              "logout"
#define FUN_LOOK                "look"
#define FUN_EXITS               "exits"
#define FUN_MORE                "more"
#define FUN_INPUT               "input"
#define FUN_NULL                "null"

// message queue item index
#define MSG_INFO                0
#define MSG_RETRY               1
#define MSG_NOTICE              2
#define MSG_SUCCESS             3
#define MSG_LAST_SEND           4
#define MSG_CONT_MSG            5
#define MSG_TOTAL_LINE          6
#define MSG_HAS_SENT            7

// bytes per send
#define MSG_BYTES               1350
#define MSG_BUFFER_LINES        128

// max inputed message len
#define MAX_WIZARD_INPUT_LEN    180000
#define MAX_PLAYER_INPUT_LEN    60000

// queue parameter
#define MSG_MAX_RETRY           8
#define MSG_RETRANS_TIME        2000
#define MAX_PACKET_IN_Q         64

// configration
#define MESSAGE_PORT            10
#define MAX_CONNECTIONS         200
#define MAX_SEND_FAILED         3

#define KEEP_ALIVE_PERIOD       180
#define SLEEP_HEART_BEAT        10

#endif
