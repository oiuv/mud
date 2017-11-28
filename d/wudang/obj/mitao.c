#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(HIM "水蜜桃" NOR, ({"shuimi tao", "shuimi", "tao"}));
        set_weight(40);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "一碟水灵新鲜的水蜜桃，跟脸蛋儿一样红艳可人。\n" NOR);
                set("unit", "碟");
                set("value", 80);
                set("food_remaining", 4);
                set("food_supply", 30);
        }
}
