// xiaohuan-dan.c 小还丹

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("小还丹", ({"xiaohuan dan", "xiaohuan", "dan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗莹白溜圆的小还丹。此丹乃少林奇"
			    "药，助长内力，灵效无比。\n");
		set("value", 10000);
		set("only_do_effect", 1);
	}

	setup();
}

int do_effect(object me)
{
	if (me->query("neili") >= me->query("max_neili") * 2 - 200)
		return notify_fail("你现在没必要吃小还丹。\n");

	me->start_busy(2);

	me->add("neili", 200);
	message_vision(HIY "$N" HIY "吃下一颗小还丹，只觉得身轻如燕，"
		       "四肢百骸真气充盈无比，几欲奔腾而出！\n" NOR, me);

	destruct(this_object());
	return 1;
}

