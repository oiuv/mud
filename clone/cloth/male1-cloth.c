// male1-cloth.c
//
// This is the basic equip for players just login.

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("布衣", ({ "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
		set("long", "一件很普通的布衣。\n");
                set("material", "cloth");
		set("value", 0);
                set("armor_prop/armor", 1);
        }
        setup();
}

