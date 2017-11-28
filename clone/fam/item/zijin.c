#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + MAG "紫金矿" NOR, ({"zijin kuang", "zijin", "kuang"}));
        set_weight(1800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", MAG "这是一块极为罕见的紫金矿石，坚如玄铁，价值连城。\n" NOR);
                set("unit", "块");
                set("value", 8000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + MAG "紫金矿" NOR);
                set("can_make", ({ "护甲", "头盔", "护腕" }));
                set("power_point", 50);
        }
}

int query_autoload()
{
        return 1;
}

