// /guanwai/ermenkan.c

inherit ROOM;

void create()
{
	set("short", "二门坎子");
	set("long", @LONG
漫长的参路蜿蜒的消失在原处的天边，路上依稀还留有一些浅浅的足印
，看来是前面的参客留下的。白茫茫的雪地反射出耀眼的银光，看得人头昏
眼花。偶尔有几只雪兔飞驰而过，转眼就无影无踪了。
LONG );
	set("exits", ([
		"east"       : __DIR__"mantianxing",
		"northwest"  : __DIR__"damenkan",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
