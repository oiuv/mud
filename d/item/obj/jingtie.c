// jingtie.c 百炼精铁

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(WHT "百炼精铁" NOR, ({"iron", "tie"}));
	set_weight(4500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一块黑黝黝的经过精心冶炼的精铁。\n");
		set("unit", "块");
		set("value", 5000);
                set("item_origin", 1);
                set("material_attrib", "iron");
                set("material_name", WHT "精铁" NOR);
                set("can_make", "all");
		set("not_make", ({ "腰带", "战衣" }));
                set("power_point", 30);
	}
}
