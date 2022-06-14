// 本文件必须包含在 <globals.h> **底部**
#ifndef MUDCORE_H
#define MUDCORE_H

#define ROOT_UID      "Root"
#define BACKBONE_UID  "Backbone"

/* 系统目录 */
// 如果核心框架目录不是默认，需要在 <globals.h> 中定义
#ifndef CORE_DIR
#define CORE_DIR "/mudcore/"
#endif
// 存档目录，应该在 <globals.h> 中定义
#ifndef DATA_DIR
#define DATA_DIR "/data/"
#endif
// 日志目录,和__LOG_DIR__保持一致，应该在 <globals.h> 中定义
#ifndef LOG_DIR
#define LOG_DIR "/log/"
#endif
/** 其它可自定义游戏文件目录
* AREA_PATTERN_DIR 游戏区域模式样式目录，可自己配置模版
* DAEMON_DIR       游戏守护进程目录，定义后可自动生成守护进程头文件
* INCLUDE_DIR      游戏头文件目录，定义后会保存自动生成的头文件在此目录
* INHERIT_DIR      游戏接口目录，定义后可自动生成接口头文件
* MOB_DIR          游戏怪物目录，如定义可使用虚拟对象接口
* NATURE_DIR       游戏天气描述目录，定义后可自己实现特色天时
* QUEST_DIR        游戏任务目录，定义后可使用任务接口
* STD_DIR          游戏标准对象目录，定义后可自动生成标准对象头文件
* VERB_DIR         游戏谓词指令目录，定义后会使用谓词语法分析指令
* WORLD_DIR        游戏世界目录，定义后可使用虚拟对象接口
 */

/* 核心对象 */
#define CORE_MASTER_OB      CORE_DIR "system/kernel/master"
#define CORE_SIMUL_EFUN_OB  CORE_DIR "system/kernel/simul_efun"
#define CORE_VOID_OB        CORE_DIR "system/object/void"
#define CORE_LOGIN_OB       CORE_DIR "system/object/login"
#define CORE_USER_OB        CORE_DIR "system/object/user"

/* 守护进程 */
#define CORE_AREA_PATTERN_D CORE_DIR "system/daemons/area_pattern_d"
#define CORE_CHANNEL_D      CORE_DIR "system/daemons/channel_d"
#define CORE_CHAR_D         CORE_DIR "system/daemons/char_d"
#define CORE_CHINESE_D      CORE_DIR "system/daemons/chinese_d"
#define CORE_COMBAT_D       CORE_DIR "system/daemons/combat_d"
#define CORE_COMMAND_D      CORE_DIR "system/daemons/command_d"
#define CORE_DBASE_D        CORE_DIR "system/daemons/dbase_d"
#define CORE_EMOTE_D        CORE_DIR "system/daemons/emote_d"
#define CORE_ENV_D          CORE_DIR "system/daemons/env_d"
#define CORE_LOGIN_D        CORE_DIR "system/daemons/login_d"
#define CORE_NAME_D         CORE_DIR "system/daemons/name_d"
#define CORE_NATURE_D       CORE_DIR "system/daemons/nature_d"
#define CORE_QUEST_D        CORE_DIR "system/daemons/quest_d"
#define CORE_TIME_D         CORE_DIR "system/daemons/time_d"
#define CORE_VERB_D         CORE_DIR "system/daemons/verb_d"
#define CORE_VIRTUAL_D      CORE_DIR "system/daemons/virtual_d"

#define CORE_INTERMUD_D             CORE_DIR "system/daemons/intermud/i2d"
#define CORE_INTERMUD_SERVICE(x)    (CORE_DIR "system/daemons/intermud/_" + x)

/* inherit 特性文件 */
#define CORE_ACTION         CORE_DIR "inherit/action"
#define CORE_AREA           CORE_DIR "inherit/area/area"
#define CORE_ATTACK         CORE_DIR "inherit/attack"
#define CORE_CLEAN_UP       CORE_DIR "inherit/clean_up"
#define CORE_COMMAND        CORE_DIR "inherit/command"
#define CORE_CONDITION_MOD  CORE_DIR "inherit/condition_mod"
#define CORE_CONDITION      CORE_DIR "inherit/condition"
#define CORE_DB             CORE_DIR "inherit/DB"
#define CORE_DBASE          CORE_DIR "inherit/dbase"
#define CORE_HTTP           CORE_DIR "inherit/Http"
#define CORE_LIVING         CORE_DIR "inherit/living"
#define CORE_MESSAGE        CORE_DIR "inherit/message"
#define CORE_MOVE           CORE_DIR "inherit/move"
#define CORE_NAME           CORE_DIR "inherit/name"
#define CORE_NOCLONE        CORE_DIR "inherit/noclone"
#define CORE_DBSAVE         CORE_DIR "inherit/dbsave"
#define CORE_ROOM           CORE_DIR "inherit/room"
#define CORE_SAVE           CORE_DIR "inherit/save"
#define CORE_TEAM           CORE_DIR "inherit/team"
#define CORE_UNIQUE         CORE_DIR "inherit/unique"
#define CORE_VERB           CORE_DIR "inherit/verb"
#define CORE_VRM            CORE_DIR "inherit/vrm"
// 玩家特殊功能
#define CORE_USER_COMBAT_RECORD CORE_DIR "inherit/user_combat_record"
#define CORE_USER_GMCP          CORE_DIR "inherit/user_gmcp"
#define CORE_USER_QUEST         CORE_DIR "inherit/user_quest"
#define CORE_USER               CORE_DIR "inherit/user"
// 标准继承对象
#define CORE_STD_AREA   CORE_DIR "inherit/std_area"
#define CORE_STD_ROOM   CORE_DIR "inherit/std_room"

/* 其他 */
// 游戏管理员账号
#ifndef WIZARD
#define WIZARD  "mudren"
#endif
// 游戏欢迎界面
#ifndef MOTD
#define MOTD    CORE_DIR "system/etc/motd"
#endif
// 玩家性别描述
#ifndef MALE
#define MALE    "男性"
#endif
#ifndef FEMALE
#define FEMALE  "女性"
#endif
// 可接任务上限
#ifndef QUEST_SIZE
#define QUEST_SIZE 20
#endif
/** 其它可定义设置
 * START_ROOM   游戏出生点
 * PRELOAD      游戏预加载目录或文件列表
 * ROBOT_NPC    聊天触发NPC: ROBOT_NPC->receive_report(me, verb, arg);
 */

/* 守护进程 */
#ifndef AREA_PATTERN_D
#define AREA_PATTERN_D   CORE_AREA_PATTERN_D
#endif

#ifndef CHANNEL_D
#define CHANNEL_D   CORE_CHANNEL_D
#endif

#ifndef CHAR_D
#define CHAR_D      CORE_CHAR_D
#endif

#ifndef CHINESE_D
#define CHINESE_D   CORE_CHINESE_D
#endif

#ifndef COMBAT_D
#define COMBAT_D    CORE_COMBAT_D
#endif

#ifndef COMMAND_D
#define COMMAND_D   CORE_COMMAND_D
#endif

#ifndef DBASE_D
#define DBASE_D     CORE_DBASE_D
#endif

#ifndef EMOTE_D
#define EMOTE_D     CORE_EMOTE_D
#endif

#ifndef ENV_D
#define ENV_D       CORE_ENV_D
#endif

#ifndef LOGIN_D
#define LOGIN_D     CORE_LOGIN_D
#endif

#ifndef INTERMUD_D
#define INTERMUD_D  CORE_INTERMUD_D
#endif

#ifndef NAME_D
#define NAME_D      CORE_NAME_D
#endif

#ifndef NATURE_D
#define NATURE_D    CORE_NATURE_D
#endif

#ifndef QUEST_D
#define QUEST_D    CORE_QUEST_D
#endif

#ifndef TIME_D
#define TIME_D      CORE_TIME_D
#endif

#ifndef VERB_D
#define VERB_D   CORE_VERB_D
#endif

#ifndef VIRTUAL_D
#define VIRTUAL_D   CORE_VIRTUAL_D
#endif

#ifndef SIMUL_EFUN_OB
#define SIMUL_EFUN_OB    CORE_SIMUL_EFUN_OB
#endif

/* 核心对象 */
#ifndef MASTER_OB
#define MASTER_OB   CORE_MASTER_OB
#endif

#ifndef LOGIN_OB
#define LOGIN_OB    CORE_LOGIN_OB
#endif

#ifndef USER_OB
#define USER_OB     CORE_USER_OB
#endif

#ifndef VOID_OB
#define VOID_OB     CORE_VOID_OB
#endif

#endif
