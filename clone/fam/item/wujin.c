#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + YEL "乌金矿" NOR, ({"wujin kuang", "wujin", "kuang"}));
        set_weight(1800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", YEL "这是一块极为罕见的乌金矿石，坚如玄铁，珍贵无比。\n" NOR);
                set("unit", "块");
                set("value", 8000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + YEL "乌金矿" NOR);
                set("can_make", ({ "剑", "刀", "锤", "短兵", "箫" }));
                set("power_point", 50);
        }
}

int query_autoload()
{
        return 1;
}

