// Room: /huanghe/huanghe4.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "黄河岸边");
	set("long", @LONG
这里是黄河岸边。黄河流淌到这里，已经泥沙浑浊了。黄色的河水
在河床里翻滚着，咆哮着，卷起一个个巨大的漩窝。黄河在这里由於受
到东面泰山的阻挡，转而向北。
LONG );
	set("exits", ([
		"west"      : __DIR__"huanghe3",
		"northeast" : __DIR__"huanghe5",
	]));
	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

