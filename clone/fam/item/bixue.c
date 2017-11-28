#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + RED "碧血石" NOR, ({"bixue shi", "bixue", "shi"}));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", RED "坚硬似铁的碧血石，石面隐隐印着血色花纹。\n" NOR);
                set("unit", "块");
                set("value", 8000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + RED "碧血石" NOR);
                set("can_make", ({ "铁掌" }));
                set("power_point", 50);
        }
}

int query_autoload()
{
        return 1;
}

