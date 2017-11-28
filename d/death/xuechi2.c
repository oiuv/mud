
#include <ansi.h>
inherit ROOM; 

void create() 
{ 
        set("short", HIR "血池地狱" NOR);
        set("long", HIR @LONG
血池地狱，你疑心怎么从酆都走到这里来了的。四处弥漫着浓厚的
血雾，你什么也看不清楚，空中浮动着若隐若现的鬼火，血池里到处是
死人肉和沸腾的鲜血，十分恐怖，只见神兽玄武正在吃着死人肉。

LONG NOR);
        set("no_clean_up", 0);
        set("objects", ([
                __DIR__"npc/xuanwu" : 1,
        ]));

        set("exits", ([ /* sizeof() == 2 */
                "up"  : "/d/death/xuechi1",
        ]));
       
        setup();
}
