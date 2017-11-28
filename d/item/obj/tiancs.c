// tiancs.c ±ù²ÏË¿

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIW "±ù²ÏË¿" NOR, ({ "white silk", "bingcan si", "si"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»Êø¾§Ó¨ÌÞÍ¸µÄÏ¸Ë¿£¬ÒþÈ»·º³ö°×¹â¡£\n");
		set("unit", "Êø");
		set("value", 100000);
                set("item_origin", 1);
                set("material_attrib", "silk");
                set("material_name", HIW "±ù²ÏË¿" NOR);
                set("can_make", ({ "±Þ", "»¤¼×", "Õ½ÒÂ", "Ñ¥×Ó", "Ñü´ø" }));
                set("power_point", 100);
	}
}

