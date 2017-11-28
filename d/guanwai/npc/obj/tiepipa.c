// tiepipa.c

#include <weapon.h>
#include <ansi.h>
inherit HAMMER;

void create()
{
        set_name(HIC"铁琵琶"NOR, ({ "tiepipa" }) );
        set_weight(50000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", "这是一把奇形铁琵琶，打造的相当精巧坚实。\n");
                set("value", 3);
                set("material", "iron");
                set("wield_msg", "$N从背上解下一把$n，然後横在手中。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }
        init_hammer(45);
        setup();
}
