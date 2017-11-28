// Room: /xiakedao/shidong8.c

#include <room.h>

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
这是一个石洞，四周是光滑的石壁，石洞内干干净净，一尘不染。
两旁点着火把，非常明亮。南面有一扇虚掩的石门。
LONG );
        set("exits", ([
                "east" : __DIR__"shidong7",
               "south" : __DIR__"road5"
        ]));

        set("item_desc", ([
                "door" : "这是一扇极厚的石门。\n"
        ]));

        set("objects", ([
                __DIR__"npc/dizi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
