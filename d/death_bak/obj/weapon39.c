#include <ansi.h>
#include <weapon.h>

inherit DAGGER;

void create()
{
        set_name(HIG "ÇàÑôÉñØ°" NOR, ({ "qingyang dagger", "dagger", "qingyang" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 3000000);
                set("material", "steel");
        }
        init_dagger(160);
        setup();
}
