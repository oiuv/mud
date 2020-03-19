#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(MAG "古松残镢" NOR, ({ "gusong jian", "gusong", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 1000000);
                set("material", "steel");
        }
        init_sword(90);
        setup();
}
