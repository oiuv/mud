// 迷宫
#include <ansi.h>
inherit VRM;

void create()
{
    //迷宫房间所继承的物件的档案名称。
    set_inherit_room( ROOM );

    //迷宫房间里的怪物。
    //set_maze_npcs(__DIR__"npc/monster");

    //迷宫的单边长
    set_maze_long(10);

    //入口方向(出口在对面)
    set_entry_dir("south");

    //入口与区域的连接方向
    set_link_entry_dir("up");

    //入口与区域的连接档案名
    set_link_entry_room(__DIR__"mogong");

    //出口与区域的连接方向
    set_link_exit_dir("down");

    //出口与区域的连接档案名
    set_link_exit_room(__DIR__"maze/0,0,0");

    //入口房间短描述
    set_entry_short(HIR "迷宫入口" NOR);

    //入口房间描述
    set_entry_desc(HIC @LONG
这里是幻境迷宫的入口，向北可进入迷宫，里面全是阴雾，寒气逼人，不小心就可能迷失方向了。
LONG NOR);

    //出口房间短描述
    set_exit_short(HIY "迷宫出口" NOR);

    //出口房间描述
    set_exit_desc(HIW @LONG
这里是幻境迷宫的出口，向南可进入迷宫，里面全是阴雾，寒气逼人，不小心就可能迷失方向了。
LONG NOR);

    //迷宫房间的短描述
    set_maze_room_short(HIM "幻境迷宫" NOR);

    //迷宫房间的描述，如果有多条描述，制造每个房
    //间的时候会从中随机选择一个。
    set_maze_room_desc(HIB @LONG
四周都是奇怪的黑雾，你胆颤心惊的向前摸索着，不时传来一阵阵鬼哭儿狼嚎,好象有什么
东西在暗中窥视着，你不由的加快了脚步。
LONG NOR);

    // 迷宫房间是否为户外房间？
    set_outdoors(0);

    // 是否绘制迷宫地图
    set_maze_map(1);
}
