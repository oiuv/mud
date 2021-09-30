// maoniurou.c 耗牛肉

inherit F_FOOD;
inherit ITEM;

void create()
{
    set_name("耗牛肉", ({ "maoniu rou", "rou" }) );
        set_weight(350);
        if( clonep() )
                set_default_object(__FILE__);
        else {
        set("long", "一块烧烤得香喷喷的耗牛肉。\n");
        set("unit", "块");
        set("value", 100);
        set("food_remaining", 4);
        set("food_supply", 25);
        }
        setup();
}
