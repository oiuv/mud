#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(HIB "ÒõÍõÅÛ" NOR, ({ "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼ş");
                set("material", "cloth");
                set("armor_prop/armor", 1);
        }
        setup();
}
