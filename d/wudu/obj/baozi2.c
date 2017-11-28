// baozi2.c 包子

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("蛇肉包子", ({"baozi", "bao"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一个香喷喷的蛇肉包子。\n");
                set("unit", "个");
                set("value", 50);
                set("food_remaining", 3);
                set("food_supply", 20);
        }
}
