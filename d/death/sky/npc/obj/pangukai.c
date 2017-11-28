#include <ansi.h>
#include <armor.h>
inherit ARMOR;
void create()
{
        set_name( WHT "盘古铠" NOR,  ({ "pangu kai", "kai", "armor" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "见");
                set("long", "一见黑黝黝的铁甲，上面雕有盘古的头像。\n");
                set("value", 100000);
                set("material", "cloth");
                set("armor_prop/armor", 200);
        }
        setup();
}

