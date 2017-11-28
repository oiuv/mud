// houting.c
inherit ROOM;
void create()
{
	set("short", "神龙教后厅");
	set("long", @LONG
这是神龙教的议事场所--潜龙厅。此厅较小，前面有两张大竹椅，
两边摆着五个小凳，看来是神龙教五龙使平时所坐的位置。
LONG );
	set("exits", ([
		"south" : __DIR__"dating",
	]));

	set("objects", ([
		CLASS_D("shenlong")+"/yin": 1,
	]));
	set("outdoors","shenlong");
	setup();
	replace_program(ROOM);
}

