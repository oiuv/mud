inherit ITEM;
inherit F_LIQUID;

#include <ansi.h>

void create()
{
        set_name(HIC "Ñ©º×ÌÀ" NOR, ({"soup"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "Ò»ÍëÏãÆøÆË±ÇµÄÑ©º×ÌÀ¡£\n");
                set("unit", "Íë");
                set("value", 80);
                set("max_liquid", 4);
        }

        set("liquid", ([
    	        "type": "water",
                "name": "Ñ©º×ÌÀ",
                "remaining": 6,
                "drunk_supply": 20,
        ]));
}

