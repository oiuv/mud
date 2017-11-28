// Room: /d/huashan/yuntai.c
#include <room.h>
inherit ROOM;

void create()
{
        set("short", "云台峰");
        set("long", @LONG
太华北峰又名云台峰，它和南面的诸峰连成一条崎岖的长岭，构成
了一条鱼椎脊似的登峰天梯。香炉峰和梁张峰拱立左右，峥嵘兀突。云
台四面都是悬崖绝壁，十分险峻。峰顶建有真武宫，朝南通道上立着石
牌楼两座，高镶“北峰顶”三字。
LONG );
        set("exits", ([ /* sizeof() == 4 */
            "southdown" : __DIR__"canglong",
        ]));
        set("outdoors", "huashan");
        setup();
}
 
void init()
{
        object me = this_player();
        if (me->query_temp("xunshan")) me->set_temp("xunshan/yuntai", 1);
        return;
}
