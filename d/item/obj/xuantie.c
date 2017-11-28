// xuantie.c 玄铁石

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(CYN "玄铁石" NOR, ({"xuan tie", "tie"}));
	set_weight(30000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一块黑黝黝有些泛光石头，掂在手中感到极为沉重，远胜铜铁。\n");
		set("unit", "块");
		set("value", 30000);
                set("item_origin", 1);
                set("material_attrib", "steel");
                set("material_name", CYN "玄铁" NOR);
                set("can_make", "all");
                set("not_make", ({ "鞭", "战衣", "锤", "腰带" }));
                set("power_point", 70);
	}
}
