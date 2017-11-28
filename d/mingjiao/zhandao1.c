//zhandao1.c
inherit ROOM;
#include <ansi.h>

void create()
{
	set("short", "栈道");
	set("long", @LONG
这里是通往明教的栈道，脚下茂林生云，极其艰险。
LONG );
	set("exits", ([
		"northup"   : __DIR__"zhandao2",
		"southdown" : __DIR__"lhqhoumen",
	]));
	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}

void init()
{
	object me = this_player();
	
	if (interactive(me) && random((int)me->query_skill("dodge")) <= 10) 
	{
		me->receive_damage("qi", 50);
		me->receive_wound("qi",  50);
message_vision(HIR"$N一不小心脚下踏了个空，... 啊...！\n"NOR, me);
		me->move(__DIR__"lhqpaifang");
		tell_object(me, HIR "你从栈道跌了下来，好疼 !还受了伤。\n" NOR);
message("vision", HIR"只见" + me->query("name") + "从栈道上扑通一声跌了下来，躺在地上半天爬不起来！\n"NOR, environment(me), me);
	}
}

