// gourou.c

inherit ITEM;
inherit F_FOOD;

void create()
{
    set_name("狗肉", ({"gou rou", "rou"}));
    set_weight(90);
    if (clonep())
        set_default_object(__FILE__);
    else {
        set("long", "一块香喷喷的狗肉。\n");
        set("unit", "块");
        set("value", 100);
        set("food_remaining", 5);
        set("food_supply", 40);
    }
}
