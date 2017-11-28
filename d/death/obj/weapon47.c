#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(RED "Îå¹íÔÂ»ªÈÐ" NOR, ({ "wugui ren", "ren", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 1200000);
                set("material", "steel");
        }
        init_blade(90);
        setup();
}
