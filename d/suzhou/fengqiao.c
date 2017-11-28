// Room: /d/suzhou/fengqiao.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "枫桥");
	set("long", @LONG
寺的北面有一座桥孔呈半圆的单空石桥--枫桥，她跨于运
河的枫桥湾。桥的东面是铁岭关，它与白虎关，浒墅关，合称
苏州三关。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"enter" : __DIR__"hanshidian",
		"north" : __DIR__"tielingguan",
	]));
	setup();
	replace_program(ROOM);
}

