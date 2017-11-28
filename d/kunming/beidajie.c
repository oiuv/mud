#include <ansi.h>
inherit ROOM;

void create()
{
        set("short",  "北大街" );
        set("long", @LONG
你走在北大街上，这里来往的人很少，正北面一座雄伟的
大门，那就是平西王吴三桂的官邸了。路的两旁整齐的种着大
树，显得十分漂亮。不时会有几个卫兵来回走动。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "south" : __DIR__"jinrilou",
                "north" : __DIR__"wangfu",
        ]));
        set("objects", ([
                "/d/beijing/npc/boy2" : 1,
        ]));
        setup();
        replace_program(ROOM);
       
}
