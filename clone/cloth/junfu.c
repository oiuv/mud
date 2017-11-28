// junfu.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("军服", ({ "junfu", "cloth" }));
	set("long", "这是一件有点旧的官兵服。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 200);
		set("armor_prop/armor", 10);
	}
	setup();
}
