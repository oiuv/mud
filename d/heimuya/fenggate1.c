#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "林间小道");
        set("long", @LONG
你走在一条颇为阴暗的林间小道上，两旁是阴森森的密树
林。向南不远便可到达日月神教下第一大堂风雷堂的大门，这
里不时有风雷堂的弟子走动。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
                "north" : __DIR__"linjxd2",
                "south" : __DIR__"fenggate",
        ]));
        set("objects", ([
                __DIR__"npc/dizi3" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
