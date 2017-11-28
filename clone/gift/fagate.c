// fagate.c 稀世玛瑙

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name(HIR "稀世玛瑙" NOR, ({ "flawless agate" }) );
	set_weight(40);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", HIR "一块光彩照人的大玛瑙，美仑"
                            "美奂，世所罕有。\n" NOR);
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
