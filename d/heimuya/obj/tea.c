inherit ITEM;
inherit F_LIQUID;
#include <ansi.h>
void create()
{
        set_name(GRN"œ„≤Ë"NOR, ({"tea"}));
        set_weight(30);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "“ª±≠œ„≤Ë°£\n");
                set("unit", "ÕÎ");
                set("value", 10);
                set("max_liquid", 20);
    }

    set("liquid", ([
        "type": "water",
        "name": "œ„≤Ë",
        "remaining": 20,
        "drunk_supply": 40,
    ]));
}

