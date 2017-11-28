// ccrystal.c 水晶残片

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name(HIM "水晶残片" NOR, ({ "chipped crystal" }) );
	set_weight(25);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", HIM "一片粉色的水晶碎片。\n" NOR);
                set("value", 20000);
		set("unit", "片");
                set("armor_prop/per", 3);
                set("wear_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "戴在头上。\n" NOR);
                set("remove_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "从头上摘了下来。\n" NOR);
	}
        setup();
}

int query_autoload() { return 1; }
