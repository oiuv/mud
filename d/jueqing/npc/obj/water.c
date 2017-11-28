inherit ITEM;
inherit F_LIQUID;

#include <ansi.h>

void create()
{
        set_name(HIY "清水" NOR, ({"water","shui"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一碗清水。\n");
                set("unit", "碗");
                set("value", 10);
                set("max_liquid", 4);
        }

        set("liquid", ([
    	        "type": "water",
                "name": "清水",
                "remaining": 6,
                "drunk_supply": 20,
        ]));
}
