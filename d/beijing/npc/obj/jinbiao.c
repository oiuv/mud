#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIY "½ποΪ" NOR, ({ "jin biao", "jin", "biao" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "Π©");
                set("value", 2000);
                set("base_unit", "Φ§");
                set("base_weight", 300);
                set("base_value", 4000);
                set("material", "iron");
        }
        set_amount(10);
        init_throwing(50);
        setup();
}
