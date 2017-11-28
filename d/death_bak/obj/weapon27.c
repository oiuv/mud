#include <ansi.h>
#include <weapon.h>

inherit WHIP;

void create()
{
        set_name(HIR "ÅÌÁúË÷" NOR, ({ "panlong suo", "suo", "panlong", "whip" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 360000);
                set("material", "steel");
        }
        init_whip(55);
        setup();
}
