inherit ROOM;

void create()
{
	set("short", "北大街");
	set("long", @LONG
你走在一条繁忙的街道上，看着操着南腔北调的人们行色
匆匆，许多人都往南边走去，那里有一个热闹的亭子。西南面
是一家戏园子，不时传来叫好声，来自各地的人们进进出出。
在东面是一个客店。西面是一个马厩。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east"      : __DIR__"kedian",
		"west" : __DIR__"xiyuan",
		"north"     : __DIR__"beidajie2",
		"south"     : __DIR__"canlangting",
	]));
	setup();
	replace_program(ROOM);
}

