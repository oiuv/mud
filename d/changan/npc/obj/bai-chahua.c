//bai-chahua.c

#include <armor.h>
#include <ansi.h>

inherit HEAD;

void create()
{
	set_name(HIW "白茶花" NOR, ({ "bai chahua", "chahua" }));
	set_weight(10);
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("long", "冰清玉洁的白茶花。\n");
		set("unit", "朵");
		set("value", 6);
		set("material", "plant");
		set("armor_prop/armor", 0);
		set("armor_prop/personality", 3);
		set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
		set("unwield_msg", "$N轻轻地把$n从头上除了下来。\n");

	}
	setup();
}
