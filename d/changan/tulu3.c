// Room:/d/changan/tulu3.c

inherit ROOM;

void create()
{
	set("short", "土路");
	set("long", @LONG
这是一条黄土飞扬的路，不算太宽，路上几乎没有行人，四周
一片荒寂。
LONG);
	set("exits",  ([  /*  sizeof()  ==  2  */
		"northeast" : __DIR__"tulu4",
		"southdown" : __DIR__"tulu2",
	]));
	set("outdoors", "changan");
	setup();
	replace_program(ROOM);
}
