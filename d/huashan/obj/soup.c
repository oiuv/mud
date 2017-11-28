// soup.c
// By Marz 03/29/96

inherit ITEM;
inherit F_LIQUID;
#include <ansi.h>
void create()
{
	set_name(MAG"ÌÀÍë"NOR, ({"soup"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÍëÏãÆøÆË±ÇµÄĞÂÏÊÒ°¹½×öµÄÌÀ¡£\n");
		set("unit", "Íë");
		set("value", 80);
	        set("max_liquid", 4);
    }

    // because a container can contain different liquid
    // we set it to contain tea at the beginning
    set("liquid", ([
        "type": "water",
        "name": "ÏÊ¹½ÌÀ",
        "remaining": 6,
        "drunk_supply": 25,
    ]));
}
