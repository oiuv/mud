// tiancs.c 冰蚕丝

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIW "冰蚕丝" NOR, ({ "white silk", "bingcan si", "si"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一束晶莹剔透的细丝，隐然泛出白光。\n");
		set("unit", "束");
		set("value", 100000);
                set("item_origin", 1);
                set("material_attrib", "silk");
                set("material_name", HIW "冰蚕丝" NOR);
                set("can_make", ({ "鞭", "护甲", "战衣", "靴子", "腰带" }));
                set("power_point", 100);
	}
}

