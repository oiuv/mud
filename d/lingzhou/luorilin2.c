// Room: /lingzhou/luorilin2.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "落日林");
	set("long", @LONG
这里是一片方圆百里的森林，林中古木参天，树荫蔽日，光线黯淡，
落日林的伐木场就在这里，这里是树木大都树龄百年以上，数人和抱的
大树比比皆是，一条不宽的土路蜿蜒通向前方。
LONG );
	set("exits", ([
		"north"     : __DIR__"tulu",
		"southwest" : __DIR__"dalu",
	]));
	set("objects", ([
		"/d/city/obj/shuzhi" : 1,
		"/clone/beast/dushe" : 1,
	]));
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}
