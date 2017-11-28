// /guanwai/damen.c

inherit ROOM;

void create()
{
	set("short", "达门");
	set("long", @LONG
天池三面壅注不流，惟独北面偏东一线斜垂，白练飞舞，这就是达门。
池水经达门外流，水流清冷，在石壁间冲撞有声。
LONG );
	set("exits", ([
		"southwest"  : __DIR__"longmen",
		"northwest"  : __DIR__"pubu",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
