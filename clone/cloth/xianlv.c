// xianlv.c

#include <ansi.h>
#include <armor.h>

inherit BOOTS;

void create()
{
        set_name( HIW "仙履" NOR, ({ "shoes", "xian lv" }) );
        set_weight(10);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "双");
                set("long", "一双仙人才穿的鞋，看起来普普通通的。\n");
                set("value", 1);
                set("armor_prop/armor", 1);
                set("material", "boots");
        }
        setup();
}
