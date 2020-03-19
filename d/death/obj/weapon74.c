#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIC "天月寒镢" NOR, ({ "tianyue jian", "tianyue", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 1500000);
                set("material", "steel");
        }
        init_sword(110);
        setup();
}
