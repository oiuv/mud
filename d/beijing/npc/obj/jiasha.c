#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name( HIR "红色袈裟" NOR, ({ "jia sha", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "一件火红色的袈裟。\n");
                set("value", 1000);
                set("material", "cloth");
                set("armor_prop/armor", 5);
        }
        setup();
}

