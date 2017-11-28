// jjunfu.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("锦衣军服", ({ "junfu", "cloth" }));
	set("long", "这是一件颜色鲜亮的锦衣军服。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 1200);
		set("armor_prop/armor", 15);
	}
	setup();
}
