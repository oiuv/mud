#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIY "ÁúÏèÉñÕë" NOR, ({ "longxiang shenzhen", "zhen" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "Ğ©");
                set("value", 200000);
                set("base_unit", "¸ù");
                set("base_weight", 300);
                set("base_value", 4000);
                set("material", "iron");
        }
        set_amount(50);
        init_throwing(100);
        setup();
}
