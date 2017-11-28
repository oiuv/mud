#include <ansi.h>
#include <weapon.h>
inherit HAMMER;

void create()
{
        set_name(HIG "水瓢" NOR, ({ "shui piao", "shui", "piao" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", HIG "这是一个用老葫芦劈开做成的瓢，普通百姓的日常务农用品。\n" NOR);
                set("value", 10);
                set("material", "steel");
                set("wield_msg", HIG "$N" HIG "拿出一个水瓢握在手中。\n" NOR);
                set("unwield_msg", HIG "$N" HIG "将手中的水瓢插在腰上。\n" NOR);
        }
        init_hammer(4);
        setup();
}
