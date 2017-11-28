// fdiamond.c 精美钻石

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name(HIW "精美钻石" NOR, ({ "flawless diamond" }) );
	set_weight(40);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", HIW "一颗精光闪闪的精美钻石，华丽异常。\n" NOR);
                set("value", 100000);
		set("unit", "颗");
                set("armor_prop/per", 7);
                set("wear_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "戴在头上。\n" NOR);
                set("remove_msg", HIC "$N" HIC "轻轻地把$n"
                    HIC "从头上摘了下来。\n" NOR);
	}
        setup();
}

int query_autoload() { return 1; }
