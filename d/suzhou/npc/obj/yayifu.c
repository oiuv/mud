// yayi_cloth.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("衙役服", ({ "yayi cloth", "cloth" }));
	set("long", "这是一件崭新的白棉布衙役服。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 150);
		set("armor_prop/armor", 5);
	}
	setup();
}
