#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(HIC "È±ÔÂÈÐ" NOR, ({ "queyue ren", "queyue", "ren", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 240000);
                set("material", "steel");
        }
        init_blade(50);
        setup();
}
