// shibing.c 柿饼

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("柿饼", ({"shi bing", "bing"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一个好甜的柿饼。\n");
                set("unit", "个");
                set("value", 20);
                set("food_remaining", 3);
                set("food_supply", 20);
        }
}
