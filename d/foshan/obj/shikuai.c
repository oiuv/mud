// shikuai.c

#include <weapon.h>
#include <ansi.h>
inherit HAMMER;

void create()
{
	set_name(HIW"石块"NOR, ({ "shikuai", "stone"}));
	set_weight(5000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "块");
		set("long", "这是一平平常常的鹅卵石。\n");
		set("value", 0);
		set("material", "stone");
		set("wield_msg", "$N搬起一块$n准备战斗。\n");
		set("unwield_msg", "$N放下手中的$n。\n");
	}

	init_hammer(1);
	setup();
}
