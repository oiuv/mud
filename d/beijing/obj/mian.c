// mian.c

inherit ITEM;

void create()
{
	set_name("面", ({ "mian" }));
        set_weight(100);
        if (clonep())
                set_default_object(__FILE__);
        else {
		set("long", "一碗热气腾腾的汤面。\n");
		set("unit", "碗");
		set("value", 100);
		set("remaining", 2);
		set("food_supply", 25);
		set("water_supply", 10);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        if ((int)me->query("food") >= (int)me->max_food_capacity())
                return notify_fail("你已经吃太饱了，再也吃不下了。\n");

        set("value", 0);
        me->add("food", (int)query("food_supply"));
        if (me->query("water") < (int)me->max_water_capacity()-(int)query("water_supply"))
                me->add("water", (int)query("water_supply"));

        if (me->is_fighting())
                me->start_busy(2);

        add("remaining", -1);
        if (query("remaining"))
                message_vision("$N端起汤面，狼吞虎咽地吃起来。\n", me);
	else 
	{ 
                message_vision("$N端起碗来，把剩下的面连汤吞了。\n"
                               "$N将碗往后一扔，抹了抹嘴，赞道：好香！\n", me);
                destruct(this_object());
	}

	return 1;
}

