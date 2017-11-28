#include <ansi.h>

inherit ROOM;

void create()
{
    set("short", "小房间");
    set("long", @LONG
这是一个小房间，桌上点着蜡烛。房中只有一桌一床，陈设简单，
却十分干净。床上铺着被褥。
LONG );
    set("exits", ([
		"south" : __DIR__"zhuang8",
    ]));
    set("objects", ([
	__DIR__"npc/furen": 1,
	__DIR__"npc/shuanger": 1,
    ]));
    set("outdoors", "beijing");
    setup();
    replace_program(ROOM); 
}
