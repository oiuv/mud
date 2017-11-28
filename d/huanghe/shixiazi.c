// Room: /huanghe/shixiazi.c
// Java Sep. 22 1998

#include <room.h>

inherit ROOM;

void create()
{
	set("short", "石峡子");
	set("long", @LONG
石峡子是以前的黄河故道，现在遍地是大大小小的鹅卵石，两边
是数丈高的高坡，千沟万壑，向你诉说着世事的沧桑。要是运气好的话
你可以在这里拣到非常漂亮、非常珍贵的雨花石。
LONG );
	set("exits", ([
		"southwest" : __DIR__"tumenzi",
		"northeast" : __DIR__"bingcao",
	]));
	set("objects", ([
		"/d/city/obj/shitou" : 1,
		"/d/hangzhou/obj/eluanshi" :1,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

