// trans_cart.c
//

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name("大车", ({ "cart" }));
        set_weight(200000);
        set_max_encumbrance(1000000);
        if (clonep())
        {
                set_default_object(__FILE__);
                call_out("destruct_me", 10);
        }
        else
        {
                set("value", 1);
                set("long", "这是一辆普通的马车，行驶在大官道上，你觉得晃晃悠悠的。\n");
                set("unit", "辆");
                set("material", "wood");
                set("no_get", "好家伙，车你也想扛在肩上？\n");
        }
        setup();
}

/*
void destruct_me()
{
        destruct(this_object());
}

*/
