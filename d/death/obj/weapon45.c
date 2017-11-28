#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(HIB "ÇàÁúÑÀ" NOR, ({ "qinglong ya", "qinglong", "ya", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 580000);
                set("material", "steel");
        }
        init_blade(70);
        setup();
}
