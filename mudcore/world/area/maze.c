// 迷宫
#include <ansi.h>
/**
 * @brief 迷宫类地图示例环境
 *
 */
inherit CORE_VRM;

void create()
{
    //迷宫房间所继承的对象的档案名称
    set_inherit_room( CORE_STD_ROOM );

    //迷宫房间里的怪物
    // set_maze_npcs(({}));

    //迷宫的单边长
    set_maze_long(10);

    //入口方向(出口在对面)
    set_entry_dir("south");

    //入口与区域的连接方向
    set_link_entry_dir("down");

    //入口与区域的连接档案名
    set_link_entry_room(VOID_OB);

    //出口与区域的连接方向
    set_link_exit_dir("enter");

    //出口与区域的连接档案名
    set_link_exit_room(__DIR__"tower");

    //入口房间短描述
    set_entry_short(HIC "魔宫南门" NOR);

    //入口房间描述
    set_entry_desc(CYN @LONG
这里是绝望与憎恶魔宫门口，向北可进入魔宫，但进入其中很容易变得绝望并充满憎恶的情绪。
LONG NOR);

    //出口房间短描述
    set_exit_short(HIC "魔宫北门" NOR);

    //出口房间描述
    set_exit_desc(CYN @LONG
这里是绝望与憎恶魔宫门口，向南可进入魔宫，据说里面很危险；不远处有一座高耸入云的魔法塔。
LONG NOR);

    //迷宫房间的短描述
    set_maze_room_short(NOR RED "绝望与憎恶魔宫" NOR);

    //迷宫房间的描述，如果有多条描述，制造每个房间的时候会从中随机选择一个。
    set_maze_room_desc(@@LONG
这里是人类绝望和憎恶情绪映射到现实世界而异化出的魔宫，在这里呆久了很容易迷失自我，变得绝望并产生各种幻觉。
这里是人类绝望和憎恶情绪映射到现实世界而异化出的魔宫，不知道是不是错觉，你总感觉有谁在暗处盯着你。
这里是人类绝望和憎恶情绪映射到现实世界而异化出的魔宫，你隐隐约约听到谁在远处呼唤你，但这里应该没有其他活人。
这里是人类绝望和憎恶情绪映射到现实世界而异化出的魔宫，附近是各种坍塌的建筑，好像曾经在此有过剧烈的战斗。
LONG);

    // 迷宫房间是否为户外房间？
    // set_outdoors(1);

    // 是否绘制迷宫地图?
    set_maze_map(1);

    // 迷宫的额外参数
    set_extra_info(([
        "area" : "maze",
        "zone/z" : 0,
    ]));
}
