inherit ITEM;
inherit F_LIQUID;

#include <ansi.h>

void create()
{
        set_name(GRN "Ëá²Ë·ÛË¿ÌÀ" NOR, ({"soup"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "Ò»ÍëÏãÆøÆË±ÇµÄËá²Ë·ÛË¿ÌÀ¡£\n");
                set("unit", "Íë");
                set("value", 160);
                set("max_liquid", 8);
        }

        set("liquid", ([
                "type": "water",
                "name": "Ëá²Ë·ÛË¿ÌÀ",
                "remaining": 12,
                "drunk_supply": 40,
        ]));
}
