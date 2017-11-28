#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
        set_name( "Ã±×Ó", ({ "hat" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("value", 500);
                set("material", "hat");
                set("armor_prop/armor", 2);
        }
        setup();
}

