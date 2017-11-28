// Room: /d/suzhou/leitai.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "擂台前广场");
	set("long", @LONG
这里是苏州擂台前面的一个大型广场，有许多人正在擂台
上比武，到处是人山人海，如果你也想试试身手，那么就请跳
上擂台比试比试吧。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"hutong1",
	]));
	setup();
	replace_program(ROOM);
}

