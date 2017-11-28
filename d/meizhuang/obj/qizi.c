#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(CYN "Æå×Ó" NOR, ({ "qi zi", "qi", "zi" }) );
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "Ð©");
                set("value", 0);
                set("base_unit", "¿Å");
                set("base_weight", 1);
                set("base_value", 0);
                set("material", "iron");
        }
        set_amount(40);
        init_throwing(10);
        setup();
}
