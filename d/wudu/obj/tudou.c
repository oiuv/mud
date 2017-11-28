// tudou.c 土豆
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("土豆", ({"tu dou", "dou"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一块圆滚滚的土豆。\n");
                set("unit", "块");
                set("value", 20);
                set("food_remaining", 3);
                set("food_supply", 20);
        }
}
