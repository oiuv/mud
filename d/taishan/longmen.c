// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", "龙门");
	set("long", @LONG
这里便是泰山十八盘的起点。此处山势陡峭，登山的人一个不
小心很容易便会跌堕到崖谷之中。
LONG );
	set("exits", ([
		"northup" : __DIR__"shengxian",
		"southdown" : __DIR__"wudafu",
	]));
	set("objects", ([
		__DIR__"npc/chi" : 1,
	]));
	set("outdoors", "taishan");
//	set("no_clean_up", 0);
	setup();
}

void init()
{
	object me = this_player();
	
	if( random((int)me->query_skill("dodge")) <= 10) 
	{
		me->receive_damage("qi", 50);
		me->receive_wound("qi",  50);
		message_vision(HIR"$N一不小心脚下踏了个空，... 啊...！\n"NOR, me);
		me->move(__DIR__"daizong");
		tell_object(me, HIR"你从山上滚了下来，只觉得浑身无处不疼，还受了几处伤。\n"NOR);
		message("vision", HIR"只见" + me->query("name") + "从山上骨碌碌地滚了下来，躺在地上半天爬不起来！\n"NOR, environment(me), me);
	}
}

