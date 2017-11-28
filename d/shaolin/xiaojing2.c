// Room: /d/shaolin/xiaojing2.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "田埂边");
	set("long", @LONG
转过山坡只见几棵果实累累的大枣树孤零零地栽在田埂边，上
面挂满了红熟的枣子，使人忍不住想摘下几颗尝尝。田里种着半熟
的青稞麦。西首有三间简陋的土屋。
LONG );
	set("exits", ([
		"southdown" : __DIR__"xiaojing1",
		"west" : __DIR__"houshan",
	]));
	set("outdoors", "shaolin");
	setup();
	replace_program(ROOM);
}

