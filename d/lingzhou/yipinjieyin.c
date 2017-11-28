// Room: /lingzhou/yipinjieyin.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "接引堂");
	set("long", @LONG
这里是西夏一品堂的接引堂，每个自愿加入一品堂的江湖高手，都
需有人充当接引人，查清底细，方能入堂。入堂以后，才有资格由赫连
主管分派任务，为一品堂效力。好在这里有个专职接引的汉子，为一品
堂广开贤路，所以一品堂在江湖中也确实声名雀起。
LONG );
	set("exits", ([
		"west"  : __DIR__"yipindayuan",
	]));
	set("objects", ([
		__DIR__"npc/nuerhai" :1,
	]));
	setup();
	replace_program(ROOM);
}

