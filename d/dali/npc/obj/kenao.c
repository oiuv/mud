// kenao.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("窄裉袄", ({ "ken ao" }));
	set("long", "这是一件少数民族常用的窄裉袄。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 400);
		set("armor_prop/armor", 5);
	}
	setup();
}
