//hong-meigui.c

#include <armor.h>
#include <ansi.h>

inherit HEAD;

void create()
{
	set_name(HIR "红玫瑰" NOR, ({ "hong meigui", "meigui" }));
	set_weight(10);
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("long", "热奔奔放的红玫瑰。\n");
		set("unit", "朵");
                set("no_sell", 1);
                set("value", 100000);
		set("material", "plant");
		set("armor_prop/armor", 0);
		set("armor_prop/personality", 3);
		set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
		set("unwield_msg", "$N轻轻地把$n从头上除了下来。\n");
		set("female_only", 1);
	}

	setup();
}

