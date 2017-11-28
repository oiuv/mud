inherit ROOM;

void create()
{
	set("short", "后院");
	set("long", @LONG
这里是万府的后院，院子里有一棵高大的松树，遮天蔽日。
西面有一道小门，门外是一片绿油油的菜地。
LONG);
	set("exits", ([
		"south" : __DIR__"dayuan",
		"west" : __DIR__"caidi",
	]));

	setup();
	replace_program(ROOM);
}

