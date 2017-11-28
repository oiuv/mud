// tongren.c

#include <weapon.h>
#include <ansi.h>
inherit HAMMER;

void create()
{
        set_name(HIY"独脚铜人"NOR, ({ "tongren" }) );
        set_weight(50000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", "这是一只沉重的独脚铜人，打造的相当粗大坚实。\n");
                set("value", 3);
                set("material", "iron");
                set("wield_msg", "$N拿出一只$n，试了试重量，然後握在手中。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }
        init_hammer(50);
        setup();
}
