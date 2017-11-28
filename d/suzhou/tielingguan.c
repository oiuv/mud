// Room: /d/suzhou/tielingguan.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "铁岭关");
	set("long", @LONG
关呈长方形，砖石结构，正中的三层敌楼为新建。铁岭关
地处水陆要冲登敌楼，既可了望，又能放炮射箭。这关垣、运
河、石桥所组成的联合工事，当时是为了防御合抵抗侵扰的倭
寇。
LONG );
	set("outdoors", "suzhou");
//	set("no_clean_up", 0);
	set("exits", ([
		"south" : __DIR__"fengqiao",
	]));
	set("objects", ([
		"/d/city/npc/wujiang" : 1,
		"/d/city/npc/bing" : 3,
	]));
	setup();
	replace_program(ROOM);
}

