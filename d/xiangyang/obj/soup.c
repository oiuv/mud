// soup.c

inherit ITEM;
inherit F_LIQUID;
#include <ansi.h>
void create()
{
	set_name(HIG"Ò°²ËÌÀÍë"NOR, ({"soup"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÍëĞÂÏÊÒ°²Ë×öµÄÌÀ¡£\n");
		set("unit", "Íë");
		set("value", 10);
                set("max_liquid", 4);
    }

    // because a container can contain different liquid
    // we set it to contain tea at the beginning
    set("liquid", ([
        "type": "water",
        "name": "Ò°²ËÌÀ",
        "remaining": 6,
        "drunk_supply": 20,
    ]));
}
