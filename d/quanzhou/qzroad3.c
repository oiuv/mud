// Room: /d/quanzhou/qzroad3.c
// Date: May 7, 96   Jay

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
你走在一条山路上。时值春日，路旁的山坡上开满了金黄色的油菜花。
LONG );
	set("exits", ([
		"north" : __DIR__"qzroad2",
		"east" : __DIR__"qzroad4",
	]));

	set("no_clean_up", 0);
	set("outdoors", "quanzhou");
	setup();
	replace_program(ROOM);
}

