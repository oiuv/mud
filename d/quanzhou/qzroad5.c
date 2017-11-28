inherit ROOM;

void create()
{
	set("short", "武夷山路");
	set("long", @LONG
你走在东南第一山脉武夷山上。海风从东面吹来，带着几
分寒意。南边就是著名的海港泉州了。
LONG);
	set("exits", ([
                "northdown" : __DIR__"qzroad4",
                "south" : __DIR__"beimen",
	]));
        set("objects", ([
		"/clone/quarry/tu" : 2
	]));
	set("outdoors", "quanzhou");
	setup();
	replace_program(ROOM);
}

