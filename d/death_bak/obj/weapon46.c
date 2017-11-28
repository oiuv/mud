#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(HIC "ÇàµñÓñ×Á" NOR, ({ "qingyu dao", "qingyu", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 1000000);
                set("material", "steel");
        }
        init_blade(80);
        setup();
}
