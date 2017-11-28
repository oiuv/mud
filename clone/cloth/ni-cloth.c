// ni-cloth.c
//

#include <armor.h>

#include <ansi.h>
inherit CLOTH;

void create()
{
        set_name(HIC"青布缁衣"NOR, ({ "zi yi", "cloth" }) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
		set("long", "一件出家人穿的青布缁衣。\n");
                set("material", "cloth");
		set("value", 0);
                set("armor_prop/armor", 8);
		set("female_only", 1);
        }
        setup();
}

