#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(MAG"воеш"NOR, ({ "zi pao", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "╪Ч");
                set("value", 200);
                set("material", "cloth");
                set("armor_prop/armor", 5);
        }
        setup();
}

