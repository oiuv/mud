// 地狱迷宫
// by Lonely
// inherit VRM_SERVER;
#include <ansi.h>
inherit "/adm/daemons/vrm_server";

void create()
{
        //迷宫房间所继承的物件的档案名称。
        set_inherit_room( ROOM );

        //迷宫房间里的怪物。
        //set_maze_npcs(__DIR__"npc/baihu");

        //迷宫的单边长
        set_maze_long(10);

        //入口方向(出口在对面)
        set_entry_dir("south");

        //入口与区域的连接方向
        set_link_entry_dir("south");

        //入口与区域的连接档案名
        set_link_entry_room(__DIR__"jimiesi");

        //出口与区域的连接方向
        set_link_exit_dir("north");

        //出口与区域的连接档案名
        set_link_exit_room(__DIR__"baihuxue");

        //入口房间短描述
        set_entry_short(HIB "黑森林" NOR);

        //入口房间描述
        set_entry_desc(HIB @LONG
这里据说就是黑森林，里面全是阴雾，阴气逼人，不小心就可能迷
失方向了。
LONG NOR);

        //出口房间短描述
        set_exit_short(HIB "黑森林" NOR);

        //出口房间描述
        set_exit_desc(HIB @LONG
你眼前一亮，深深的吸了口气，心想总算是出来了。不过景色忽的一
变，眼前出现一个黑乎乎的山洞。
LONG NOR
);

        //迷宫房间的短描述
        set_maze_room_short(HIB "黑森林" NOR);

        //迷宫房间的描述，如果有多条描述，制造每个房
        //间的时候会从中随机选择一个。
        set_maze_room_desc(HIB @LONG
四周越来越暗了，你胆颤心惊的向前摸索着，到处是一些
迷路人的尸体和骷髅。不时传来一阵阵鬼哭儿狼嚎,好象有什么
东西在暗中窥视着，你不由的加快了脚步。
LONG NOR
);

        // 迷宫房间是否为户外房间？
        set_outdoors(0);
}


