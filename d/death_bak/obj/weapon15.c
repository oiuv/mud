#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
        set_name(HIG "ÌìÑÄ¹Õ" NOR, ({ "tianya guai", "guai", "tianya", "staff" }) );
        set_weight(13000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 900000);
                set("material", "steel");
        }
        init_staff(80);
        setup();
}

