
inherit ITEM;
inherit F_FOOD;

void create()
{
    set_name("熟牛肉", ({"niu rou", "rou"}));
    set_weight(200);
    if (clonep())
        set_default_object(__FILE__);
    else {
        set("long", "一块香喷喷的熟牛肉。\n");
        set("unit", "只");
        set("value", 150);
        set("food_remaining", 3);
        set("food_supply", 60);
    }
}
