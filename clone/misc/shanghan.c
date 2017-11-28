// shanghan.c 伤寒愁

inherit ITEM;

#include <ansi.h>

void create()
{
	set_name(HIY"伤寒愁"NOR, ({"shanghan chou", "shanghanchou"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包专治伤寒的药，灵验无比。\n");
		set("value", 1000);
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	if (!me->query_condition("ill_shanghan"))
	{
		write("你现在又没有得伤寒，别乱吃药。\n");
		return 1;
	} else {
		me->clear_condition("ill_shanghan");
		message_vision("$N吃下一包伤寒愁，气色看起来好多了。\n", me);
		me->start_busy(2);
		destruct(this_object());
		return 1;
	}
}

