#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIC "江中铁索" NOR);
        set("long", @LONG
你站在一江水之中的一条铁索上，铁索随水起伏不停，你站在这里，若没顶
尖的轻功，是坚持不了多久的。从这里向江中看去，更觉得气势宏大，江水奔流，
向江心看去，好象水低有一些古怪的东西。

LONG);
        setup();
} 

void init()
{
	add_action("do_jump", "jump");
}

int do_jump (string arg)
{
 	object me = this_player();
	if (! arg || arg == "") return 0;
	if (arg == "down")
	{
		if(! random(10)) 
		{
                	me->set_temp("die_reason", "跳河死了");
			me->die();
		} else
		{
			tell_object(me, "你奋不顾身的跳进了江中，一阵江水涌来……\n");
			me->move(__DIR__"river");
		 	me->unconcious();}
			return 1;
		}	
	else
	return notify_fail("你要做什么？\n");
}