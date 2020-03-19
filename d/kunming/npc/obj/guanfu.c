// guanfu.c 

#include <armor.h>
#include <ansi.h>
inherit CLOTH;

void create()
{
        set_name( HIC "官服" NOR, ({ "guan fu", "fu" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("material", "丝");
		set("value", 5000);
                set("armor_prop/armor", 3);
        }
        setup();
}

