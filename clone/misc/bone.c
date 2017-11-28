// bone.c 人骨

#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
	set_name(WHT "人骨" NOR, ({ "bone", "gu" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "根");
		set("value", 0);
		set("material", "bone");
		set("long", "这是一根白森森的人骨头。\n");
		set("wield_msg", "$N抽出一把$n握在手中。\n");
		set("unequip_msg", "$N将手中的$n插回腰间。\n");
	}
	init_staff(1);
	setup();
}
