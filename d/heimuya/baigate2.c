#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "碎石小道");
        set("long", @LONG
这里是一条碎石小道，向西可到达日月神教下第二大堂白
虎堂的大门，这里不时有白虎堂的弟子走动。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
                "north" : __DIR__"baigate1",
                "south" : __DIR__"linjxd3",
        ]));
        set("objects", ([
                __DIR__"npc/dizi4" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
