#include <ansi.h>
#include <weapon.h>

inherit DAGGER;

void create()
{
        set_name(WHT "Óã³¦½£" NOR, ({ "yuchang dagger", "dagger", "yuchang" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 2000000);
                set("material", "steel");
        }
        init_dagger(100);
        setup();
}
