//lan-tiane

#include <armor.h>
#include <ansi.h>

inherit HEAD;

void create()
{
	set_name(HIB "蓝天鹅" NOR, ({ "lan tiane", "tiane" }));
	set_weight(10);
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("long", "庄重朴实的蓝天鹅。\n");
		set("unit", "朵");
		set("value", 6);
		set("material", "plant");
		set("armor_prop/armor", 0);
		set("armor_prop/personality", 3);
		set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
		set("unwield_msg", "$N轻轻地把$n从头上除了下来。\n");
		set("female_only", 1);

	}

	setup();
}
