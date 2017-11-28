#include <ansi.h>

inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name(HIW "汤碗" NOR, ({ "soup" }));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一碗香气扑鼻的青菜汤。\n");
		set("unit", "只");
		set("value", 10);
	        set("max_liquid", 4);
        }

        set("liquid", ([
                "type": "water",
                "name": "菜汤",
                "remaining": 6,
                "drunk_supply": 30,
        ]));
}
