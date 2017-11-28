// shourou1.c 狍子肉

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("狍子肉", ({"paozi rou", "rou"}));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一块风干的腊肉。\n");
                set("unit", "块");
                set("value", 20);
                set("food_remaining", 15);
                set("food_supply", 100);
        }
}
