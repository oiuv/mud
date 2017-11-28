#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
        set_name(HIR "ÅÌÁúÕÈ" NOR, ({ "panlong zhang", "zhang", "panlong", "staff" }) );
        set_weight(8000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 250000);
                set("material", "steel");
        }
        init_staff(50);
        setup();
}

