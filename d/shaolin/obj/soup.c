inherit ITEM;
inherit F_LIQUID;

#include <ansi.h>

void create()
{
        set_name(GRN "酸菜粉丝汤" NOR, ({"soup"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一碗香气扑鼻的酸菜粉丝汤。\n");
                set("unit", "碗");
                set("value", 160);
                set("max_liquid", 8);
        }

        set("liquid", ([
                "type": "water",
                "name": "酸菜粉丝汤",
                "remaining": 12,
                "drunk_supply": 40,
        ]));
}
