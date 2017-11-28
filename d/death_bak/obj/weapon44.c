#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(CYN "ºñ±³Ó¥µ¶" NOR, ({ "ying dao", "ying", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 340000);
                set("material", "steel");
        }
        init_blade(65);
        setup();
}
