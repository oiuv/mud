inherit ROOM;
#include <ansi.h>

void create()
{
	set("short","鳌府大厅");
	set("long", @LONG
这里是鳌拜府的大厅，大厅相当的宽敞明亮，四周的墙上悬挂满了各朝名
人的真迹，正堂坐着一个满面虬须，身材魁梧，身着黄马褂的中年男子，看来
那就是当朝第一大臣，被御封为“满洲第一勇士”的鳌拜了。大厅往北是一条
走廊，那是通往鳌府的后院所在。
LONG );
	set("exits", ([
		"north" :  __DIR__"aofu_zoulang2",
		"south" :  __DIR__"aofu_dayuan",
	]));
	set("objects", ([
		__DIR__"npc/aobai" : 1,
		__DIR__"npc/yahuan_a" : 1,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
	object ob;
	if (objectp(ob = present("ao bai", environment(me))) && living(ob) && dir == "north")
		return notify_fail("鳌拜大声喝道：他奶奶的，你要干嘛？\n\n");
	return ::valid_leave(me, dir);
}
