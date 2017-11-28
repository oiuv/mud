#include <room.h>
inherit ROOM;

void create()
{
        set("short", "林间小径");
        set("long", @LONG
你走在一条小径上，两旁种满了竹子，修篁森森，绿荫满
地，除了竹叶声和鸟鸣声，听不到别的动静。南面似乎有一座
简陋的小院。
LONG );
        set("exits", ([
                "south" : __DIR__"xiaoyuan.c",
                "north" : __DIR__"xiaolu1",
        ]));
        set("objects", ([
                CLASS_D("wudang") + "/qingfeng": 1,
                CLASS_D("wudang") + "/mingyue": 1,
        ]));
        create_door("south", "竹门", "north", DOOR_CLOSED);
        set("outdoors", "wudang");
        setup();
        replace_program(ROOM);
}
