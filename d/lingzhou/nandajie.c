// Room: /lingzhou/nandajie.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "南大街");
	set("long", @LONG
这里是灵州南大街，也是商业最繁华的地段，一眼望去只见街两旁
店铺林立，五颜六色的店招和旗帜在阳光的照耀下分外鲜明，街上行人
很是不少，西面是一家酒馆，东面是一家车马店。
LONG );
	set("exits", ([
		"south" : __DIR__"nanmen",
		"north" : __DIR__"center",
		"east"  : __DIR__"chema",
		"west"  : __DIR__"jiuguan",
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

