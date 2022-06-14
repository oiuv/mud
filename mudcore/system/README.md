<!--
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-29 15:52:47
 * @LastEditTime: 2022-03-29 15:52:47
 * @LastEditors: 雪风
 * @Description:
 *  https://bbs.mud.ren
-->
mudcore 框架系统目录，提供部分守护进程（daemons）和游戏核对对象（kernel），游戏LIB可选择继承使用。

### 核心对象(Kernel)

核对对象包括游戏运行必需的主控对象和模拟外部函数对象，可选择继承。

名称|文件路径|核心功能
-|-|-
CORE_MASTER_OB|/system/kernel/master|主控对象，负责接收玩家连接请求、安全验证、日志记录等核心功能
CORE_SIMUL_EFUN_OB|/system/kernel/simul_efun|模拟外部函数对象，负责实现模拟外部函数功能
CORE_LOGIN_OB|/system/object/login|示例登陆对象，仅供参考，正式开发千万不要继承使用
CORE_USER_OB|/system/object/user|示例玩家对象，仅供参考，正式开发千万不要继承使用
CORE_VOID_OB|/system/object/void|临时环境，示例登录房间

### 守护进程(Daemons)

守护进程是独立出来的系统服务，每个进程有自己的API可以调用，具体功能可阅读源码。

名称|文件路径|核心功能
-|-|-
CORE_AREA_PATTERN_D|/system/daemons/area_pattern_d.c|区域模式环境样式模型管理
CORE_CHANNEL_D|/system/daemons/channel_d.c|负责处理玩家聊天功能和频道管理
CORE_CHAR_D|/system/daemons/char_d.c|负责处理角色数据，需开发者实现具体功能
CORE_CHINESE_D|/system/daemons/chinese_d.c|负责处理中、英文对照，以及一些与中文相关的功能，字典存档`/data/e2c_dict.o`
CORE_COMBAT_D|/system/daemons/combat_d.c|负责战斗功能，需开发者实现具体功能
CORE_COMMAND_D|/system/daemons/command_d.c|负责指令及别名处理功能
CORE_DBASE_D|/system/daemons/dbase_d.c|负责系统数据存档处理，默认存储位置`/data/dbase_d.o`
CORE_EMOTE_D|/system/daemons/emote_d.c|负责管理游戏表情动作和相应功能，默认存储位置`/data/emote_d.o`
CORE_ENV_D|/system/daemons/env_d.c|游戏环境变量配置守护进程，默认配置文件为`/data/.env`
CORE_INTERMUD_D|/system/daemons/intermud/i2d.c|MUD网际互联守护进程
CORE_LOGIN_D|/system/daemons/login_d.c|框架示例登录管理功能，可做开发参考
CORE_NAME_D|/system/daemons/name_d.c|负责角色姓名记录与检测，默认存储位置`/data/name_d.o`
CORE_NATURE_D|/system/daemons/nature_d.c|负责控制游戏季节和天气变化
CORE_QUEST_D|/system/daemons/quest_d.c|游戏任务守护进程
CORE_TIME_D|/system/daemons/time_d.c|负责控制游戏系统时间和计划任务
CORE_VERB_D|/system/daemons/verb_d.c|自然语法谓词指令守护进程
CORE_VIRTUAL_D|/system/daemons/virtual_d.c|负责虚拟对象处理
