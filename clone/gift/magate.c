// magate.c 神之玛瑙

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name(HIR "神之玛瑙" NOR, ({ "magic agate" }) );
	set_weight(50);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", HIR "一块闪烁这奇异光芒的暗红色玛瑙，"
                    "让人感到一阵阵的心悸。\n" NOR);
                set("value", 200000);
		set("unit", "块");
                set("can_be_enchased", 1);
                set("magic/type", "fire");
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
