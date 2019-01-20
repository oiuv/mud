// xiangcha.c 香茶
// By Marz 03/29/96

inherit ITEM;

void create()
{
	set_name("香茶",({"tea", "cha", "xiang cha"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一杯热茶，悠悠地冒着香气～～～\n");
		set("unit", "杯");
		set("value", 1000);
        	set("remaining", 2);
        	set("drink_supply", 25);
		set("only_do_effect", 1);
		set("can_drink", 1);
	}
	
	setup();
}

int do_effect(object me)
{
	int /*heal,*/ recover, jing, e_jing, m_jing;
	recover = 5;

	if ((int)me->query("water") >= (int)me->max_water_capacity())
		return notify_fail("你已经喝太多了，再也灌不下一滴水了。\n");

	set("value", 0);
	me->add("water", (int)query("drink_supply"));
	jing = (int)this_player()->query("jing");
	e_jing = (int)this_player()->query("eff_jing");
	m_jing = (int)this_player()->query("max_jing");

	if (me->is_fighting())
		me->start_busy(2);
	add("remaining", -1);
	if (query("remaining"))
	{
		message_vision("$N端起杯香茶，有滋有味地品了几口。\n"+
			       "一股香气直入心脾，$N觉得精神好多了。\n", me);
	} else 
	{ 
		message_vision("$N端起雕花小杯，把剩下的香茶一饮而尽。\n" +
			       "一股香气直入心脾，$N觉得精神好多了。\n", me);
		destruct(this_object());
	}
	return 1;
}
