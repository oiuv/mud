// male4-cloth.c
//
// This is the basic equip for players just login.

#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name( HIC "短打劲装" NOR, ({ "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
		set("long", "一件很利索的短打劲装。\n");
                set("material", "cloth");
		set("value", 0);
                set("armor_prop/armor", 1);
        }
        setup();
}

