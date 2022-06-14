<!--
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-29 15:54:01
 * @LastEditTime: 2022-03-29 15:54:01
 * @LastEditors: 雪风
 * @Description:
 *  https://bbs.mud.ren
-->
mudcore 框架提供的功能模块，游戏LIB可选择性的继承使用。

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
