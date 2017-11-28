#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(MAG "π≈À…≤–Ô„" NOR, ({ "gusong jian", "gusong", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±˙");
                set("value", 1000000);
                set("material", "steel");
        }
        init_sword(90);
        setup();
}
