#include <ansi.h>
#include <weapon.h>

inherit WHIP;

void create()
{
        set_name(WHT "馄饨灵索" NOR, ({ "huntun suo", "huntun", "suo", "whip" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 1200000);
                set("material", "steel");
        }
        init_whip(90);
        setup();
}
