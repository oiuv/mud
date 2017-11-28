// Room: /d/hengshan/yunge.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "云阁虹桥");
        set("long", @LONG
过完栈道，就到云阁虹桥。前往恒山主峰见性峰，都要在这里
跨过唐峪河。拱桥卧波，水天亮丽，倍觉胸襟舒畅。
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "east"      : __DIR__"daziling",
           "northdown" : __DIR__"zhandao",
        ]));
	set("objects", ([
		__DIR__"npc/zhi" : 1,
	]));
        set("outdoors", "hengshan");
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

