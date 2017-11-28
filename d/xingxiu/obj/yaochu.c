// weapon: /d/xingxiu/npc/obj/yaochu.c
// Jay 3/18/96

#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name("药锄", ({ "yaochu", "chu" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", "这是一把采药用的药锄，已经有些生锈了。\n");
                set("value", 100);
                set("material", "iron");
                set("wield_msg", "$N拿出一把$n，握在手中。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }

        init_hammer(5);
        setup();
}

