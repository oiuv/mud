// zhujian.c

#include <weapon.h>

inherit SWORD;

void create()
{
	set_name("竹剑",({ "zhu jian", "jian", "sword" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("value", 100);
		set("material", "bamboo");
		set("long", "这是一柄三尺来长，精工制成的青竹剑，虽不致命，却可伤人。\n");
		set("wield_msg", "$N拿出一把$n，握在手中。\n");
		set("unequip_msg", "$N放下手中的$n。\n");
	}
	init_sword(10);
	setup();
}
