#include <ansi.h>
inherit COMBINED_ITEM;

void create()
{
        set_name(NOR + WHT "干粮" NOR, ({ "gan liang", "gan", "liang" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "这是一块便于携带的干粮。\n" NOR);
                set("base_unit", "块");
                set("base_value", 50);
                set("base_weight", 10);
                set("only_do_effect", 1);
        }
        setup();
        set_amount(1);
}

int do_effect(object me)
{
	if (me->query("food") >= me->max_food_capacity())
        {
                write("你已经吃太饱了，再也塞不下任何东西了。\n");
                return 1;
        }

        message_vision("$N摸出一块" + name() + "啃了几口。\n" NOR, me);
        me->add("food", 100);

        add_amount(-1);

        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
