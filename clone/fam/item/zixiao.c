#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + MAG "紫宵觖" NOR, ({"zixiao jue", "zixiao", "jue"}));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", MAG "韧性极强的绸缎，其中混有部分天蚕丝。\n" NOR);
                set("unit", "张");
                set("value", 8000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + MAG "紫宵觖" NOR);
                set("can_make", ({ "战衣", "腰带", "护腕", "靴子" }));
                set("power_point", 50);
        }
}

int query_autoload()
{
        return 1;
}

