inherit ROOM;

void create()
{
	set("short", "西门");
	set("long", @LONG
这里乃是佛山镇的西门。岭南以西经由广西可至大理。东
面一条东西向的大街是佛山镇的主要街道。
LONG);
	set("outdoors", "foshan");
	set("exits", ([
	        "east" : __DIR__"street1",
	        "west" : __DIR__"road7",
	]));
	setup();
	replace_program(ROOM);
}

