#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name( WHT "灰白长衫" NOR, ({ "chang shan", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "一件灰白色的普通长衫。\n");
                set("value", 50);
                set("material", "cloth");
                set("armor_prop/armor", 2);
        }
        setup();
}

