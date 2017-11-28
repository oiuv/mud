#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + CYN "昆仑石" NOR, ({"kunlun shi", "kunlun", "shi"}));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", CYN "这是一块通体乌黑的石头，石面沁出着丝丝寒意。\n" NOR);
                set("unit", "块");
                set("value", 10000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + CYN "昆仑石" NOR);
                set("can_make", ({ "铁掌" }));
                set("power_point", 70);
        }
}

int query_autoload()
{
        return 1;
}

