#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
	set_name(HIW "银铠甲" NOR, ({ "silver armor", "silver", "armor", "jia" }));
	set_weight(80000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "副");
		set("long", HIW "一副全银制的重铠甲，在中原很难见到。\n" NOR);
		set("value", 20000);
		set("material", "boots");
                set("armor_prop/armor", 200);
		set("armor_prop/dodge", -80);
	}
	setup();
}
