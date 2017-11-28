// fork.c

#include <weapon.h>
inherit CLUB;

void create()
{
	set_name("三股叉", ({ "sangu cha" }));
	set_weight(5000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "杆");
		set("long", "这是一杆三尖开刃的三股叉。\n");
		set("value", 1500);
		set("rigidity",100);
		set("material", "steel");
		set("wield_msg", "$N掣出一杆$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n反别身后。\n");
	}
  	init_club(15);
	setup();
}

