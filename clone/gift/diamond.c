// diamond.c 钻石

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name(HIW "钻石" NOR, ({ "diamond" }) );
	set_weight(30);
	if( clonep() )
		set_default_object(__FILE__);
        else {
	        set("long", HIW "一粒精光闪闪的钻石。\n" NOR);
                set("value", 50000);
		set("unit", "粒");
                set("armor_prop/per", 5);
                set("wear_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "戴在头上。\n" NOR);
                set("remove_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "从头上摘了下来。\n" NOR);
	}
        setup();
}

int query_autoload() { return 1; }
