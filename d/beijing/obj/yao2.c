#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIC"回春丸"NOR, ({"huichun wan", "wan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "粒");
		set("value", 2000);
	}
	setup();
}

int init()
{
	add_action("do_eat", "eat");
}

int do_eat(string arg)
{
	object me = this_player();

	if(!id(arg)) return notify_fail("你要吃什么？\n");
	if( me->is_busy() )
		return notify_fail("别急，慢慢吃，小心别噎着了。\n");
	message_vision("$N吃下一粒" + name() + "。\n", me);

	if (((int)me->query_condition("xx_poison") > 0) ||
	((me->query("eff_jing") / me->query("max_jing")) < 0.9))
	{
		me->receive_curing("jing", (int)me->query("max_jing") / 50);
	}
	me->start_busy(2);
	destruct(this_object());
	return 1;
}

