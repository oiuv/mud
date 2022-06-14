# 泥芯(MudCore) - LPMUD 游戏开发框架

![mudcore](https://api.mud.ren/storage/uploads/2020/02/13/c5a880553865b046d14c13b042318438.png)

[![Created Badge](https://badges.pufler.dev/created/oiuv/mudcore)](https://github.com/oiuv/mudcore)
[![Updated Badge](https://badges.pufler.dev/updated/oiuv/mudcore)](https://github.com/oiuv/mudcore)
[![Visits Badge](https://badges.pufler.dev/visits/oiuv/mudcore)](https://github.com/oiuv/mudcore)

LPMUD游戏开发框架核心代码，仅仅包括核心代码，可以在此基础上开发任何MUD，本框架需配合 FluffOS v2019使用。

当前版本：`v1.4.3`

这个项目的诞生源于我的[LPC零基础开发教程](https://bbs.mud.ren)，在写教程的过程中，发现很多朋友并不关心底层细节，只想能直接用来开发项目，国内绝大多数项目是《东方故事2》底层的，都是在这类MUD基础上修改，优点是可以快速上手，但不够灵活。能不能把底层独立出来，开发任何类型的MUD都可以使用？在思考后，我开始了这个项目，特色是只提供底层代码和接口，不提供任何游戏性的内容，独立于个人项目之外，只需简单配置即可实现个人MUD开发。本项目不考虑旧版的兼容性，只支持 FluffOS v2019 版。

 - 框架下载地址：https://github.com/mudcore/mudcore
 - 国内镜像地址：https://gitee.com/mudcore/mudcore
 - 框架基础示例：https://gitee.com/mudcore/mud (可在此基础上直接开发新MUD)
 - 框架使用教程：https://bbs.mud.ren/threads/99 (在现有MUD中集成MudCore框架)

致谢：本框架开发代码、结构、功能和思路上大量的参考借鉴了ES2系列游戏、重生的世界MUD、火影忍者MUD、DeadSouls等，感谢这些优秀MUD。

## 框架特色

框架提供大量常用模拟外部函数和最基本的游戏底层（包括指令系统、聊天频道、表情系统和档案存取功能），可以用来快速开发个人的MUD，框架部分独立维护，更新升级不影响个人项目。个人项目目录结构和功能灵活自主，框架提供的功能可灵活选择使用，只需要继承对应模块即可。

注意：项目开发不要继承 **CORE_LOGIN_OB** 和 **CORE_USER_OB**，这二个为示例文件，仅供演示和参考，请务必自己实现登录对象和玩家对象。

## 框架使用说明

把本框架放在你的MUD项目中，推荐保持默认目录名称 `mudcore`，并做如下配置：

1. 运行时配置文件<config.ini>中定义包含文件目录：

```ini
include directories : /include:/mudcore/include
```

2. 全局包含头文件<globals.h>中做如下配置：

```c
// 定义日志目录
#define LOG_DIR "/log/"

// 定义存档目录
#define DATA_DIR "/data/"

// 引用框架头文件(放在最后)
#include <mudcore.h>
```

3. 主控对象文件继承框架对象：

```
inherit CORE_MASTER_OB;
```

4. 模拟外部函数文件继承框架对象：

```
inherit CORE_SIMUL_EFUN_OB;
```

只需要以上配置，你的MUD基本框架就可以正常启动，并自带登录注册功能。

对新MUD开发，如果不想使用框架提供的登录注册功能，请在 <globals.h> 中定义连线对象`LOGIN_OB` 和 `USER_OB` 指向自己实现功能的文件。

个人开发MUD不建议直接修改 `mudcore` 的任何代码，如果需要增加功能，请通过继承和覆盖的方式实现。

如果需要预加载，请定义 `PRELOAD` 并指定文件列表位置，在对应文件列出预加载对象文件。

如果使用系统自带注册登录系统，但想使用个人的欢迎界面，请定义 `MOTD` 并指定位置，如果需要更多的玩家信息初始化，可以定义 `CHAR_D` 并从 `setup()` 方法中初始化。

如果要使用框架提供的指令系统，请在<globals.h>中做如下示例定义：

```c
// 管理员
#define WIZARD "mudren"

// 管理员指令路径
#define CMD_PATH_WIZ ({"/cmds/wiz/", "/mudcore/cmds/wizard/"})

// 玩家指令路径
#define CMD_PATH_STD ({"/cmds/std/", "/mudcore/cmds/player/"})

```

指令需要实现以下方法：

```c
int main(object me, string arg)
{
    // todo 指令功能

    return 1;
}

int help(object me)
{
    // todo 指令使用说明

    return 1;
}
```

如果你是使用泥芯框架从零开始开发新游戏，可参考框架使用演示教程：https://bbs.mud.ren/threads/66

除了新开发游戏，老游戏也可以引入框架并使用框架的功能，具体参考：https://bbs.mud.ren/threads/99

## 框架功能介绍

### 目录结构

目录|说明
-|-
cmds|框架提供的基本指令，可覆盖
docs|开发者文档，包括框架模拟外部函数说明文档等
include|框架头文件
inherit|框架特性继承文件
system|系统文件目录

#### system系统目录

目录|说明
-|-
system/kernel|系统核心文件，包括master对象和simul_efun对象
system/daemons|系统守护进程
system/object|系统核心对象，包括登录对象、基本玩家对象和 VOID 环境

### 核心对象

名称|文件路径|核心功能
-|-|-
CORE_MASTER_OB|/system/kernel/master|主控对象，负责接收玩家连接请求、安全验证、日志记录等核心功能
CORE_SIMUL_EFUN_OB|/system/kernel/simul_efun|模拟外部函数对象，负责实现模拟外部函数功能
CORE_LOGIN_OB|/system/object/login|示例登陆对象，仅供参考，正式开发千万不要继承使用
CORE_USER_OB|/system/object/user|示例玩家对象，仅供参考，正式开发千万不要继承使用
CORE_VOID_OB|/system/object/void|临时环境，示例登录房间

### 系统头文件(Include Headers)

头文件在 `/include/` 目录中，主要是常量宏定义和函数声明，框架基本提供如下头文件：

文件|说明
-|-
ansi.h|定义ANSI 色彩/游标控制码
dbase.h|数据增删改查功能（CORE_DBASE）函数声明
function.h|驱动提供，配合 functionp() 使用
localtime.h|驱动提供，配合 localtime() 使用
mudcore.h|框架全局头文件，需要在项目的 <globals.h> 中引用
mysql.h|定义数据库配置
origin.h|驱动提供，配合 origin() 使用
parser_error.h|驱动提供，定义 parser error
runtime_config.h|驱动提供，配合 get_config() 使用
socket_err.h|驱动提供，配合 socket_error() 使用
socket.h|定义 socket 类型，配合 socket_create() 使用
type.h|驱动提供，配合 typeof() 使用

### 继承特征(Inherit Objects)

继承文件在 `/inherit/` 目录，实现了核心的功能片段，方便直接使用，具体参考 `/docs/inherit/` 目录。基本提供如下继承文件：

名称|文件|说明
-|-|-
CORE_ACTION|/inherit/action.c|角色行动接口，实现限制行为功能
CORE_AREA|/inherit/area/area.c|游戏区域环境标准接口，实现区域模式环境功能
CORE_ATTACK|/inherit/attack.c|角色攻击接口，实现战斗行为功能，需自己实现具体战斗方式
CORE_CLEAN_UP|/inherit/clean_up.c|自动清理接口，实现 clean_up() 方法的垃圾回收功能
CORE_COMMAND|/inherit/command.c|角色指令系统接口，实现生物对象特征功能
CORE_CONDITION_MOD|/inherit/condition_mod.c|角色增益功能接口，提供增益相关方法
CORE_CONDITION|/inherit/condition.c|角色增益状态控制接口，实现游戏BUFF功能
CORE_DB|/inherit/DB.c|MySQL数据库接口，可以优雅的操作数据库的增删改查
CORE_DBASE|/inherit/dbase.c|数据存取功能接口，实现对象参数的增删改查功能
CORE_DBSAVE|/inherit/dbsave.c|系统数据存取接口，配合 DBASE_D 使用
CORE_HTTP|/inherit/Http.c|HTTP客户端，方便发起http请求
CORE_LIVING|/inherit/living.c|生物对象功能接口，所有生物对接可直接继承使用
CORE_MESSAGE|/inherit/message.c|玩家信息处理功能接口，实现分页显示
CORE_MOVE|/inherit/move.c|对象移动接口，由角色、物品对象继承，方便移动
CORE_NAME|/inherit/name.c|ID和名称接口，让对象可以被看见(查找)和命名
CORE_NOCLONE|/inherit/noclone.c|限制对象禁止被复制功能接口，需调用`check_clone()`检查
CORE_ROOM|/inherit/room.c|游戏环境标准接口，实现房间核心功能，需要继承DBASE、NAME、CLEAN_UP
CORE_SAVE|/inherit/save.c|对象数据存取接口，主要是玩家角色使用存档和读档
CORE_TEAM|/inherit/team.c|角色组队功能接口，实现组队相关功能
CORE_UNIQUE|/inherit/unique.c|对象唯一性功能接口，注意和noclone不同，唯一性允许复制，但仅限一次
CORE_USER_COMBAT_RECORD|/inherit/user_combat_record.c|玩家战斗记录功能，实现玩家战斗数据记录
CORE_USER_GMCP|/inherit/user_gmcp.c|玩家GMCP功能接口，可配合mudlet客户端使用
CORE_USER_QUEST|/inherit/user_quest.c|玩家任务功能接口，实现玩家任务记录与管理
CORE_USER|/inherit/user.c|玩家对象功能接口
CORE_VERB|/inherit/verb.c|自然语法分析指令功能接口
CORE_VRM|/inherit/vrm.c|随机迷宫功能接口，实现随机迷宫功能

### 守护进程(Daemons)

守护进程是独立出来的系统服务，每个进程有自己的API可以调用，具体参考 `/docs/dameons/` 目录。

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

另外，在MUDCORE的`/system/daemons/http/`下面提供了二个http服务示例：

* iqa_d.c : 智能答问机器人
* qq_d.c : QQ群聊天互通机器人

### 系统函数(Simul-Efuns)

除驱动自带的 efun 外，框架提供了部分模拟外部函数，具体使用参考 `/docs/simul_efun/` 目录，或查看函数源码（`/system/kernel/simul_efun/`）。

simul-efun|简介
-|-
all_environment|返回对象的所有环境
ansi|转换 $HIR$ 等为 ansi 颜色代码
area_environment|比較二個对象是否處在相同的區域座標中
area_move|將對象移動到指定區域的指定坐標位置
area_move_side|將who移到與me同一格的區域坐標位置
array_sum|返回数组元素的和
assure_file|建立文件目录
atof|string 类型数字转 float 类型数字
atoi|string 类型数字转 int 类型数字
bitCheck|检查数值指定为是否为1
bitClear|返回数值指定位为0的值
bitmap_font|处理中英文字符并点阵输出
bitSet|返回数值指定位为1的值
break_string|根据指定宽度换行显示内容
cat|输出文件内容到屏幕
check_control|判断指定字符串是否包含控制字符
check_return|判断指定字符串是否包含换行符
check_space|判断指定字符串是否包含空格
chinese_number|返回中文数字
chinese|返回指定字符串的中文名称
color_cat|彩色输出内容到屏幕
color_len|统计字符串中颜色占用的长度
config|读取或设置游戏自定义配置的值
debug|随机颜色输出内容
deep_path_list|获取指定目录及子目录下的文件列表
element_of_weighted|根据权重随机返回元素，权重高机率大
env|读取或设置游戏自定义配置的值(config的别名)
expand_keys|把键为数组的映射展示
file_exists|判断文件是否存在
getcid|返回复制对象的ID
graph_draw|自定义进度条绘图
highest|返回一组数值的最大值
is_chinese|判断指定字符串是否为中文
is_english|判断指定字符串是否为英文
is_numeric|判断指定字符串是否为数字
log_file|记录日志到指定文件
log_time|方便日志记录的 ctime 时间格式
lowest|返回一组数值的最小值
msg|智能区域消息
number_string|转化数字为科学计数法的字符串格式
percent|返回数字在指定基数上的百分比
percent_of|返回数据在指定倍数上的百分比
print_r|数组打印功能，格式化输出，开发调试用
process_bar|显示指定百分比的进度条
pronoun|返回中文人称代词
range|返回指定范围内符合条件的数值
read_lines|以数组的形式返回文件每一行内容，并跳过空行和`#`或`;`开头的注释行
remove_ansi|清理 ansi 颜色代码
sort_string|根据指定宽度换行显示内容，中文支持更友好
sum|返回一组数值的和
tail|输出文件尾部最多10行内容到屏幕
unicode|UNICODE编码转字符，如 unicode(65) 或 unicode(0x41) 返回值为 A

### 默认指令

泥芯框架提供了部分基础指令辅助使用，具体指令参考`/mudcore/cmds/`目录和`/mudcore/verbs/`目录。
