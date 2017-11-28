#include <room.h>
inherit ROOM;

void create()
{
        set("short", "回春堂药店");
        set("long", @LONG
回春堂药店是整个北京城里最大最有名气的药铺。你还没走进这里，便闻
到一股浓浓的药材气味，那是从药柜上的几百个小抽屉里散发出来的。一位伙
计在柜台后站着，堆着笑脸招呼着客人。
LONG );
       set("exits", ([
                "west" : __DIR__"xi_2",
                "east" : __DIR__"liandan_neiting",
        ]));
        set("objects", ([
                __DIR__"npc/old2" : 1,
                __DIR__"npc/kid1" : 1,
                __DIR__"npc/yaopuhuoji" : 1,
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

