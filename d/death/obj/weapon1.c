#include <ansi.h>

#include <weapon.h>

inherit CLUB;

void create()
{
        set_name(HIY"如意盘龙棍"NOR, ({ "panlong gun","gun", "panlong" }) );
        set_weight(8000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 250000);
                set("material", "steel");
                set("long", "一根沉甸甸雕着盘龙的长棍。\n");
        }
        init_club(50);
        setup();
}

