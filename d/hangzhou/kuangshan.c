// /d/hangzhou/kuangshan.c

#include <ansi.h>
#include <room.h>

inherit PRODUCING_ROOM;

void create()
{
	set("short", "铜矿山");
	set("long", @LONG
这里是山脚，山坡蜿蜒并不陡峭，很多地方挖开了一些洞口，不
少人出出入入、来来往往，在搬运一些东西。你看到地上有着不少石
头，蓝色晶莹，好像是宝石一般，似乎质地不是很纯，有些地方泛着
白花花的杂质。
LONG );
	set("exits", ([
		"west" : __DIR__"kslu2",
	]));

        set("objects", ([
                __DIR__"npc/jiangong" : 1,
        ]));

        set("no_fight", 1);

        set("product/cuprum_ore", ([ "name" : "铜矿石",
                                     "rate" : 100,
                                     "max"  : 10000, ]));

	set("outdoors", "hangzhou");
	setup();
        replace_program(PRODUCING_ROOM);
        set_heart_beat(120);
}
