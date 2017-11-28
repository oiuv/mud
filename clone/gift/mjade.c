// mjade.c 神之翡翠

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name(HIG "神之翡翠" NOR, ({ "magic jade" }) );
	set_weight(50);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", HIG "一颗焕发着奇异的光彩的翡翠，"
                    "给人以不同寻常的感觉。\n" NOR);
                set("value", 200000);
		set("unit", "颗");
                set("can_be_enchased", 1);
                set("magic/type", "cold");
                set("magic/power", 15 + random(16));
                set("armor_prop/per", 8);
                set("wear_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "戴在头上。\n" NOR);
                set("remove_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "从头上摘了下来。\n" NOR);
	}
        setup();
}

int query_autoload() { return 1; }
