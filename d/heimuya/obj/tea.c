inherit ITEM;
inherit F_LIQUID;
#include <ansi.h>
void create()
{
        set_name(GRN"香茶"NOR, ({"tea"}));
        set_weight(30);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一杯香茶。\n");
                set("unit", "碗");
                set("value", 10);
                set("max_liquid", 20);
    }

    set("liquid", ([
        "type": "water",
        "name": "香茶",
        "remaining": 20,
        "drunk_supply": 40,
    ]));
}

