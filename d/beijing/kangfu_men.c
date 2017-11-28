inherit ROOM;
#include <ansi.h>

void create()
{
	set("short","康府大门");
	set("long", @LONG
这里便是康亲王的王府大门所在。来到这里，一座富丽堂皇的巨宅院出现
在你的眼前，大门两侧是两头高大的石狮子。门上挂着两个灯笼，赫然写着大
大的“康”字。门前站着两个提刀的侍卫，警惕的注视着过往的行人。
LONG );
	set("exits", ([
		"west" : __DIR__"bei_2",
		"east" : __DIR__"kangfu_dayuan",
	]));
	set("objects", ([
		__DIR__"npc/shi_k" : 2,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
	if (objectp(present("shi wei", environment(me))) && dir == "east")
		return notify_fail("康府侍卫一把拦住你，朗声喝道：王府要地，怎由闲杂人等随便进出。\n\n");
	return ::valid_leave(me, dir);
}
