// cha.c 奶茶

inherit ITEM;

void create()
{
	set_name("奶茶",({ "tea", "cha", "nai cha"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一碗浓浓的奶茶，散发出诱人的香气。\n");
		set("unit", "碗");
		set("value", 300);
        	set("remaining", 5);
        	set("drink_supply", 60);
		set("only_do_effect", 1);
		set("can_drink", 1);
	}
	
	setup();
}

int do_effect(object me)
{
	if ((int)me->query("water") >= (int)me->max_water_capacity())
		return notify_fail("你已经喝太多了，再也灌不下一滴水了。\n");

	set("value", 0);
	me->add("water", (int)query("drink_supply"));

        me->receive_heal("qi", 50);
	add("remaining", -1);
	if (query("remaining"))
	{
		message_vision("$N端起奶茶，“咕咚咕咚”喝了几口，觉"
                               "得体力充沛多了。\n", me);
	} else 
	{ 
		message_vision("$N“咕咚咕咚”将剩下的奶茶一饮"
                               "而尽，只觉得一股力量涌了上来。\n", me);
		destruct(this_object());
	}
	return 1;
}

