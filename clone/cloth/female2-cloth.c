// female2-cloth.c
//
// This is the basic equip for players just login.

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("白绸衫", ({ "white cloth", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
		set("long", "一件轻盈漂动的白绸轻衫。\n");
                set("material", "cloth");
                set("value", 0);
                set("armor_prop/armor", 3);
		set("female_only", 1);
        }
        setup();
}

