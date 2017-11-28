inherit ROOM;

void create()
{
	set("short", "东门");
	set("long", @LONG
这里是佛山镇的东门。再往东走，不久就要离开佛山去往
福建了。西面一条东西向的大街是佛山镇的主要街道。
LONG);
	set("outdoors", "foshan");
	set("exits", ([
	    "east" : __DIR__"road8",
	    "west" : __DIR__"street5",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

