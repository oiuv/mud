#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
        set_name(HIR "╟коиух" NOR, ({ "baxian zhang", "zhang", "baxian", "staff" }) );
        set_weight(13000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "╦Ы");
                set("value", 1400000);
                set("material", "steel");
        }
        init_staff(100);
        setup();
}

