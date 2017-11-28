inherit ROOM;
#include <ansi.h>

void create()
{
	set("short","鳌府大门");
	set("long", @LONG
一座富丽堂皇的大宅院出现在你的眼前，两头高大的石狮子镇住了大门两
侧。门额上悬挂一方横匾，写着‘满洲第一勇士鳌拜府’几个大字，门外有官
兵把守，戒备森严。门上挂着两个灯笼，赫然写着“鳌”字。这里就是当朝第
一大臣，被御封为“满洲第一勇士”的鳌拜的府邸。
LONG );
	set("exits", ([
		"north" : __DIR__"aofu_zoulang1",
		"south" : __DIR__"di_4",
	]));
	set("objects", ([
		 __DIR__"npc/shi_a" : 2,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
	if (objectp(present("shi wei", environment(me))) && dir == "north")
		return notify_fail("鳌府侍卫一把拦住你，朗声喝道：王府要地，怎由闲杂人等随便进出。\n\n");
	return ::valid_leave(me, dir);
}
