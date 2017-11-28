#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name( HIY "黄马褂" NOR, ({ "huang magua", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "皇上御赐的黄马褂。\n");
                set("value", 1000);
                set("no_sell", "这，这可不敢买！");
                set("material", "cloth");
                set("armor_prop/armor", 10);
        }
        setup();
}

