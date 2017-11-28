// Room: /d/suzhou/liuyuan.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "留园");
	set("long", @LONG
留园是苏州的一大名景之一，它以结构布局紧密、厅堂华
丽宏敝、装饰精美典雅而享有“吴中第一名园”之誉。
LONG );
	set("outdoors", "suzhou");
//	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"nandajie2",
		"west"  : __DIR__"hehuating",
	]));
	set("objects", ([
		__DIR__"npc/lady1" : 1,
	]));
	setup();
	replace_program(ROOM);
}

