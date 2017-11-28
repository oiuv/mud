#include "herb.h"

void create()
{
        set_name(NOR + CYN "蛇胆" NOR, ({ "she dan", "she", "dan", "herb_shedan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + CYN "这是一颗新鲜的蛇胆，颇具药力。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 1200);
                set("base_weight", 50);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        message_vision(HIG "$N" HIG "一仰脖，将" + name() +
                       HIG "整个吞下，咂了咂嘴。\n" NOR, me);

        add_amount(-1);

        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
