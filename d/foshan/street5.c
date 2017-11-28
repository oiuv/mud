inherit ROOM;

void create()
{
	set("short", "东镇街");
	set("long", @LONG
佛山镇街东西相连。东边是镇东门，南面一堵高墙，墙后
便是凤天南开的「英雄典当」，非常惹人注目。
LONG);
	set("objects", ([
	        "/clone/quarry/gou2" : 1,
	        __DIR__"npc/jiading" : 2,
	]));
	set("outdoors", "foshan");
	set("exits", ([
	        "south" : __DIR__"dangpu",
	        "west"  : __DIR__"street4",
	        "east"  : __DIR__"eastgate",
	]));
	setup();
	replace_program(ROOM);
}

