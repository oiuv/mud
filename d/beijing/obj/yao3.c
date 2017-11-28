inherit ITEM;
#include <ansi.h>

void setup()
{}

void init()
{
	add_action("do_eat", "eat");
}

void create()
{
	set_name(HIY"金创药"NOR, ({"jinchuang yao", "jinchuang", "yao"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包武林人士必备的金创药。\n");
		set("value", 5000);
	}
	setup();
}

int do_eat(string arg)
{
	object me = this_player();
	if (!id(arg))
		return notify_fail("你要吃什么药？\n");
	if (me->is_busy() )
		return notify_fail("别急，慢慢吃，小心别噎着了。\n");
	if ((int)me->query("eff_qi") == (int)me->query("max_qi"))
		return notify_fail("你现在不需要用金创药。\n");
	else {
		me->receive_curing("qi", 50);
		message_vision("$N吃下一包金创药，气色看起来好多了。\n", me);
		me->start_busy(2);
		destruct(this_object());
		return 1;
	}
}

