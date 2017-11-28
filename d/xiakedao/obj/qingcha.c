// qingcha.c 清茶

inherit ITEM;

void init();
void do_eat();

void create()
{
        set_name("清茶",({"tea", "cha", "qing cha"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一杯热茶，悠悠地冒着香气～～～\n");
                set("unit", "杯");
                set("value", 1000);
                set("remaining", 2);
                set("drink_supply", 25);
                set("can_drink", 1);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        int heal, recover, jing, e_jing, m_jing;

        recover = 5;

        if (me->query("water") >= me->max_water_capacity())
                return notify_fail("你已经喝太多了，再也灌不下一滴水了。\n");

        set("value", 0);
        me->add("water", (int)query("drink_supply"));
        jing = me->query("jing");
        e_jing = me->query("eff_jing");
        m_jing = me->query("max_jing");

        if (jing < e_jing)
        {
                if (jing + recover >= e_jing)
                        me->set("jing", e_jing);
                else
                        me->set("jing", jing + recover);
        }

        if (me->is_fighting())
                me->start_busy(2);

        add("remaining", -1);
        if (query("remaining"))
        {
                message_vision("$N端起杯清茶，有滋有味地品了几口。\n" +
                               "一种清爽的感觉直入心脾，$N觉得精神好多了。\n", me);
        } else
        {
                message_vision("$N端起镂花小杯，把剩下的清茶一饮而尽。\n" +
                               "真是沁人心脾，$N觉得精神好多了。\n", me);
                destruct(this_object());
        }
        return 1;
}
