// fjade.c 稀世翡翠

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name(HIG "稀世翡翠" NOR, ({ "flawless jade" }) );
	set_weight(40);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", HIG "一块美得无与伦比的大翡翠。\n" NOR);
                set("value", 100000);
		set("unit", "块");
                set("armor_prop/per", 7);
                set("wear_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "戴在头上。\n" NOR);
                set("remove_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "从头上摘了下来。\n" NOR);
	}
        setup();
}

int query_autoload() { return 1; }
