//skirt.c

#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
	set_name("轻纱长裙", ({ "skirt", "cloth" }));
	set_weight(1000);
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("long", "一条朦朦胧胧的纱裙，闻起来还有一股淡香。\n");
		set("unit", "条");
		set("value", 0);
		set("material", "cloth");
		set("armor_prop/armor", 1);
		set("armor_prop/personality", 3);
		set("female_only", 1);
	}

	setup();
}
