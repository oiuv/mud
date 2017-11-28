// shanshen.c 老山参

inherit ITEM;

void create()
{
        set_name("老山参", ({"laoshan shen", "shen"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "株");
                set("long", "这是一株沾满山泥的老山参。\n");
                set("value", 10000);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        if (me->query("eff_qi") > me->query("max_qi") - 20)
                return notify_fail("你现在没有必要服用这支老山参。\n");

        me->add("eff_qi", 200);

        message_vision("$N吃下一株老山参，只觉得浑身一股热气兜底冒了上来 !\n", this_player());
        destruct(this_object());
        return 1;
}
