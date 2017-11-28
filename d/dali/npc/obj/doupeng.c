// doupeng.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("斗篷", ({ "dou peng" }));
	set("long", "这是一件绿色宽大的斗篷。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 200);
		set("armor_prop/armor", 3);
	}
	setup();
}
