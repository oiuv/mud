// butian.c 补天石

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIM "补天石" NOR, ({"magic stone", "butian shi", "shi"}));
	set_weight(6000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "传说这是女娲补天剩下的五彩石，不知是真是假。\n");
		set("unit", "块");
		set("value", 10000);
                set("item_origin", 1);
                set("material_attrib", "magic stone");
                set("material_name", HIM "神铁" NOR);
                set("can_make", "all");
		set("not_make", ({ "战衣", "腰带" }));
                set("power_point", 100);
	}
}

