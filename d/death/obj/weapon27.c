#include <ansi.h>
#include <weapon.h>

inherit WHIP;

void create()
{
        set_name(HIR "盘龙索" NOR, ({ "panlong suo", "suo", "panlong", "whip" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 360000);
                set("material", "steel");
        }
        init_whip(55);
        setup();
}
