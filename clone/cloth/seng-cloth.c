// seng-cloth.c
//

#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(CYN"灰布袈裟"NOR, ({ "jia sha", "cloth" }) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
		set("long", "一件出家人常穿的灰布袈裟。\n");
		set("value", 0);
                set("material", "cloth");
                set("armor_prop/armor", 8);
        }
        setup();
}

