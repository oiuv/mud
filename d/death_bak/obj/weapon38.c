#include <ansi.h>
#include <weapon.h>

inherit DAGGER;

void create()
{
        set_name(HIB "¶¾ç±×Ó" NOR, ({ "duling dagger", "dagger", "duling" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 2500000);
                set("material", "steel");
        }
        init_dagger(140);
        setup();
}
