inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "东厂");
        set("long", @LONG
这里就是京城的特务机构——东厂。大厅内很是宽阔，这里警备深严，穿
着制服的东厂官兵和太监在这里来回走动。大厅正中有一位年老的太监，看来
是这里的总管了。
LONG NOR);

        set("exits", ([
                "north" : __DIR__"dongchang_men",
        ]));
        set("objects", ([
                __DIR__"npc/haigonggong" : 1,
                __DIR__"npc/taijian" : 4,
                __DIR__"npc/xiaoguizi" : 1,
        ]));
        set("no_fight", 1);
        setup();
        replace_program(ROOM);
}

