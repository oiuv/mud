#include <armor.h>
inherit HEAD;

void create()
{
        set_name( "束发金带" , ({ "jindai" }) );
        set_weight(50);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "条");
                set("long","这是一条用金丝织成的束发带子\n");
                set("value", 1500);
                set("material", "silk");
                set("armor_prop/armor", 1);
		set("female_only", 1);
        set("wear_msg", "$N将$n拿出束在头发上。\n");
        }
        setup();
}
