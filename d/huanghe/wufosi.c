// Room: /huanghe/wufosi.c
// Java Sep. 22 1998

#include <room.h>

inherit ROOM;

void create()
{
	set("short", "五佛寺");
	set("long", @LONG
这里是一个被废弃的破庙，周围全是沙丘，破庙的寺门已经倒塌，地
上有块半埋在沙里的匾，从剥落的金字上你依稀可以辨别出“五佛寺”三
个字，唯一尚算完整的建筑是大殿，但屋顶上全是窟窿，强劲的西北风吹
过发出难听的“呜---呜---”声。
LONG );
	set("exits", ([
		"south"     : __DIR__"shimen",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

