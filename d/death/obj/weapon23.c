#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIW "天穹神针" NOR, ({ "tianqiong shenzhen", "zhen" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 100000);
                set("base_unit", "根");
                set("base_weight", 300);
                set("base_value", 2000);
                set("material", "iron");
        }
        set_amount(50);
        init_throwing(70);
        setup();
}
