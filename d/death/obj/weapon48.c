#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(RED "七煞阴阳刃" NOR, ({ "yinyang ren", "ren", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 1300000);
                set("material", "steel");
        }
        init_blade(100);
        setup();
}
