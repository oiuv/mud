#include <ansi.h>
#include <weapon.h>

inherit CLUB;

void create()
{
	set_name(HIY "熟铜棍" NOR, ({"shutong gun", "shutong", "gun", "club"}));
	set_weight(2000);

	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "杆");
		set("long", HIY "一杆十分灵便的熟铜棍。\n" NOR);
		set("value", 1000);
		set("material", "steel");
		set("wield_msg", HIY "$N" HIY "回手从身后抽出一杆熟铜棍。\n" NOR);
		set("unwield_msg", HIY "$N" HIY "手往后一扣，把熟铜棍放在身后。\n" NOR);
	}
	init_club(60);
	setup();
}
