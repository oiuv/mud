#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIW "ÏÉº×ÉñÕë" NOR, ({ "xianhe shenzhen", "zhen" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "Ð©");
                set("value", 50000);
                set("base_unit", "¸ù");
                set("base_weight", 300);
                set("base_value", 1000);
                set("material", "iron");
        }
        set_amount(50);
        init_throwing(50);
        setup();
}
