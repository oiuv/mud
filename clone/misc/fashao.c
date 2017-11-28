// fashao.c 退烧灵

inherit ITEM;

#include <ansi.h>

void create()
{
	set_name(HIY"退烧灵"NOR, ({"tuishao ling", "tuishao ling"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包治发烧的药，疗效显著。\n");
		set("value", 200);
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	if (! me->query_condition("ill_fashao"))
	{
		write("你现在又没有发烧，别乱吃药。\n");
		return 1;
	} else {
		me->clear_condition("ill_fashao");
		message_vision("$N吃下一包退烧灵，看起来精神多了。\n", me);
		me->start_busy(2);
		destruct(this_object());
		return 1;
	}
}
