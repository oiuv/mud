// chanhs.c 缠魂丝

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(WHT "缠魂丝" NOR, ({"silk", "chan hunsi", "si"}));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一束晶莹透明的细丝，是用蛛丝和蚕丝混合织就而成的。\n");
		set("unit", "束");
		set("value", 10000);
                set("item_origin", 1);
                set("material_attrib", "silk");
                set("material_name", WHT "缠魂丝" NOR);
                set("can_make", ({ "鞭", "护甲", "战衣", "靴子", "腰带" }));
                set("power_point", 35);
	}
}
