// zhike.c 止咳药

inherit ITEM;

#include <ansi.h>

void create()
{
	set_name(HIY"止咳药"NOR, ({"zhike yao", "zhikeyao"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包常见的止咳药。\n");
		set("value", 100);
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	if (! me->query_condition("ill_kesou"))
	{
		write("你现在又没有咳嗽，别乱吃药。\n");
		return 1;
	} else {
		me->clear_condition("ill_kesou");
		message_vision("$N吃下一包止咳药，咳嗽轻多了。\n", me);
		me->start_busy(2);
		destruct(this_object());
		return 1;
	}
}
