// Room: /d/suzhou/datiepu.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "打铁铺");
	set("long", @LONG
这是一家简陋的打铁铺，中心一个火炉，炉火忽红忽青，
热焰灼人。一位光膀铁匠满头大汗挥舞着铁锤，专心致志地在
打铁。墙角堆满了已完工和未完工的铁器等物。
LONG );
	set("outdoors", "suzhou");
	set("exits", ([
		"north" : __DIR__"dongdajie2",
	]));
        set("objects", ([
		"/d/city/npc/smith": 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

