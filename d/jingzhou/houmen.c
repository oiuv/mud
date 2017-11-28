inherit ROOM;

void create()
{
	set("short", "后门");
	set("long", @LONG
这里是关帝庙的后门，朝望北去，不远处是一个小山坡。
LONG);
	set("exits", ([
		"south" : __DIR__"houdian",
		"northup" :__DIR__"xiaoshan",
	]));

	setup();
	replace_program(ROOM);
}

