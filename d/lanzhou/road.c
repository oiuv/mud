inherit ROOM;
#include <ansi.h>;

void create ()
{
        set("short", "荒道");
        set("long", @LONG
这里是兰州城北门外的一条甚为僻静的小路，虽然离城区
不远，平时却很少有人来到这里。道路两旁杂草丛生，四周残
戈断壁，一派荒凉无际的废城景象。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "west" : "/d/shenfeng/guandao1",
                "east" : __DIR__"nroad1",
        ]));

        setup();
        replace_program(ROOM);
}

