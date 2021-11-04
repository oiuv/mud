inherit ITEM;
inherit F_FOOD;

void create()
{
    set_name("蟒蛇肉", ({"she rou", "she"}));
    set_weight(3000);
    if (clonep())
        set_default_object(__FILE__);
    else {
        set("long", "一大块蟒蛇肉。\n");
        set("unit", "块");
        set("value", 500);
        set("food_remaining", 25);
        set("food_supply", 50);
    }
}
