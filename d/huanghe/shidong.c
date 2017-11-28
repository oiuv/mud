// Room: /huanghe/shidong.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "石洞");
	set("long", @LONG
这是沙漠中天然形成的一个石洞，洞中光线昏暗，但却十分干燥，
地下铺者几堆稻草，似乎是供人睡卧之用，静心凝听，洞中仿佛有阵阵
水声。洞的一角放着数堆人头骨(skulls)。
LONG );
	set("exits", ([
		"out" : __DIR__"shamo1",
	]));
	set("item_desc", ([
		"skulls" : "一堆整整齐齐的骷髅头，上一中三下五，不多不少，恰是
九颗白骨骷髅头。\n",
	]));
	set("objects", ([
		CLASS_D("taohua") + "/mei" : 1,
		CLASS_D("taohua") + "/chen": 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

