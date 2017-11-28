#include <ansi.h>
#include <weapon.h>

inherit HAMMER;

void create()
{
	set_name(WHT "开山斧" NOR, ({"kaishan fu", "kaishan", "fu"}));
	set_weight(5000);

	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", WHT "一柄十分锋利的大斧。\n" NOR);
		set("value", 100);
		set("material", "iron");
		set("wield_msg", WHT "$N" WHT "回手从身后抽出一柄大斧。\n" NOR);
		set("unwield_msg", WHT "$N" WHT "手往后一别，把大斧插在后腰上。\n" NOR);
	}
	init_hammer(60);
	setup();
}
