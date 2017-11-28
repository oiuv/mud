// guanfu.c 

#include <armor.h>
#include <ansi.h>
inherit CLOTH;

void create()
{
        set_name( HIC "¹Ù·þ" NOR, ({ "guan fu", "fu" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("material", "Ë¿");
		set("value", 5000);
                set("armor_prop/armor", 3);
        }
        setup();
}

