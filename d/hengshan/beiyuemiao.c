// Room: /d/hengshan/beiyuemiao.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "北岳庙");
        set("long", @LONG
北岳庙是个巍巍壮观的宫殿庙宇，山门三重，高列阜上，其下
石阶数层。这里是北岳庙最大最高的 "朝殿" 。
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "east"      : __DIR__"kutianjing",
           "west"      : __DIR__"jijiaoshi",
           "northup"   : __DIR__"beiyuedian",
           "southdown" : __DIR__"guolaoling",
        ]));
	set("objects", ([
		__DIR__"npc/he" : 1,
	]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

