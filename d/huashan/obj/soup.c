// soup.c
// By Marz 03/29/96

inherit ITEM;
inherit F_LIQUID;
#include <ansi.h>
void create()
{
	set_name(MAG"汤碗"NOR, ({"soup"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一碗香气扑鼻的新鲜野菇做的汤。\n");
		set("unit", "碗");
		set("value", 80);
	        set("max_liquid", 4);
    }

    // because a container can contain different liquid
    // we set it to contain tea at the beginning
    set("liquid", ([
        "type": "water",
        "name": "鲜菇汤",
        "remaining": 6,
        "drunk_supply": 25,
    ]));
}
