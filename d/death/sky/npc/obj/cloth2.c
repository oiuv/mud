#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(HIY "µñÁú³¤ÅÛ" NOR, ({ "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("value", 6000);
                set("material", "cloth");
                set("armor_prop/armor", 1);
        }
        setup();
}

