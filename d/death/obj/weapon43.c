#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(YEL "凤凰镢" NOR, ({ "fenghuang jue", "fenghuang", "jue", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 320000);
                set("material", "steel");
        }
        init_blade(58);
        setup();
}
