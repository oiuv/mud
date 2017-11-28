// version.h

#ifndef _VERSION_H_
#define _VERSION_H_

// VERSION-FTP的错误号
#define RESULT_OK               "1 "            // 结果正常
#define RESULT_VERSION          "2 "            // 返回版本
#define RESULT_FILE             "10 "           // 返回文件
#define RESULT_NO_VERSION       "90 "           // 没有版本
#define RESULT_FINISH           "91 "            // 同步完毕
#define RESULT_ERR              "99 "           // 未知错误

// VERSION-FTP服务器端的状态
#define STATUS_LOGIN            1               // 刚刚登录
#define STATUS_WAIT_COMMAND     2               // 等待命令
#define STATUS_SENDING          3               // 发送文件

// VERSION-FTP客户端的状态
#define STATUS_CONNECTING       101             // 连接中
#define STATUS_GET_VERSION      102             // 获得版本
#define STATUS_GET_VERSION_DATA 103             // 获得版本数据
#define STATUS_GET_FILE         104             // 读取文件
#define STATUS_SYN              105             // 同步中
#define STATUS_FINISHED         106             // 同步结束

// VERSION-FTP信息结构中的条目
#define STATUS                  0               // 状态
#define FILE_NAME               1               // 文件名字
#define FILE_POS                2               // 文件位置
#define FILE_SIZE               3               // 文件大小
#define CMD_QUEUE               4               // 待处理的命令
#define PENDING_WRITE           5               // 等待发送的信息
#define CMD_BUFFER              6               // (服务器端)缓冲区
#define RESULT_BUFFER           6               // (客户端)缓冲区

// 每次通常应答返回的长度
#define NORMAL_RESULT_LEN       80              // 80个字节

// 每次发送的文件块大小
#define FILE_BLOCK              1460            // 每次发送1460

#endif
