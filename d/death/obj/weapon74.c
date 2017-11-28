#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIC "ÌìÔÂº®ïã" NOR, ({ "tianyue jian", "tianyue", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 1500000);
                set("material", "steel");
        }
        init_sword(110);
        setup();
}
