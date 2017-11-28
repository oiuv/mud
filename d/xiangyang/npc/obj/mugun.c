// mugun.c

#include <weapon.h>
inherit CLUB;

void create()
{
	set_name("木棍", ({ "mu gun", "club", "gun" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "杆");
		set("long", "这是一杆木匠做的木棍，手工相当精细。\n");
		set("value", 50);
		set("material", "steel");
		set("wield_msg", "$N从腰带里抽出一杆$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回腰带上。\n");
	}
	init_club(3);
	setup();
}
