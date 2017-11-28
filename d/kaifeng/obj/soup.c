inherit ITEM;
inherit F_LIQUID;

#include <ansi.h>

void create()
{
        set_name(HIY "±¬½ªöêÓãÌÀ" NOR, ({"soup"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "Ò»ÍëÏãÆøÆË±ÇµÄöêÓãÌÀ¡£\n");
                set("unit", "Íë");
                set("value", 80);
                set("max_liquid", 4);
        }

        set("liquid", ([
    	        "type": "water",
                "name": "öêÓãÌÀ",
                "remaining": 6,
                "drunk_supply": 20,
        ]));
}

