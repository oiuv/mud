// Room: /d/fuzhou/nandajie.c
// may. 12 1998 Java

inherit ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
街道两侧，榕木参天。福州盛夏苦热，广植榕树以纳凉
爽，别名“榕城”。西面是府衙，东面是一家闽菜馆。
LONG );
	set("exits", ([
		"south"   : __DIR__"nanmendou",
		"north"   : __DIR__"dongjiekou",
		"east"    : __DIR__"weizhongwei",
		"west"    : __DIR__"yamen",
	]));
	set("objects", ([
		__DIR__"npc/xiaofan" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

