// Room: /d/shaolin/shijie10.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "石阶");
	set("long", @LONG
松树与松树似乎都挤在一块生长，阳光到这里变得格外黯淡
只在地上留下斑驳的碎影。静听不远处格的一声，象是松枝断落
的声音。
LONG );
	set("exits", ([
		"southdown" : __DIR__"shijie9",
		"northup" : __DIR__"shijie11",
	]));
	set("outdoors", "shaolin");
	setup();
	replace_program(ROOM);
}

