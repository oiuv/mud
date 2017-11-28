inherit ROOM;

void create()
{
	set("short","北门");
	set("long",@LONG
这里是佛山镇的北门。出北门再向北，翻过南岭可达中原。
南面一条东西向的大街是佛山镇的主要街道。
LONG);
	set("outdoors", "foshan");
	set("exits", ([
	        "south" : __DIR__"street3",
	        "north" : __DIR__"nanling",
	]));
	setup();
	replace_program(ROOM);
}

