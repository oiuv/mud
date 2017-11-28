#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(WHT "黑血神针" NOR, ({ "heixue shenzhen", "heixue", "shenzhen", "zhen" }) );
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 0);
                set("base_unit", "根");
                set("base_weight", 200);
                set("base_value", 0);
                set("material", "iron");
                set("long", WHT "这是一些暗灰色的细长金针，长约寸许。\n" NOR);
        }
        set_amount(50);
        init_throwing(50);
        setup();
}
