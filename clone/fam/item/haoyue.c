#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + HIY "皓月金砂" NOR, ({"haoyue jinsha", "haoyue", "jinsha", "sha"}));
        set_weight(4000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "潮汐之季由海渊所采出的金砂，乃武林中人梦寐以求的宝物。\n" NOR);
                set("unit", "袋");
                set("value", 10000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + HIY "皓月金砂" NOR);
                set("can_make", ({ "护甲", "头盔", "护腕" }));
                set("power_point", 70);
        }
}

int query_autoload()
{
        return 1;
}

