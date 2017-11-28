#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name( HIW "白虎皮裘" NOR, ({ "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "一件用白虎皮所制作的短袄。\n");
                set("value", 50000);
                set("material", "cloth");
                set("armor_prop/armor", 30);
        }
        setup();
}

