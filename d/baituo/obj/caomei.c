// caomei.c

inherit F_FOOD;
inherit ITEM;

void create()
{
    set_name("草莓", ({ "cao mei", "mei" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
        set("long", "一颗鲜红的草莓。\n");
        set("unit", "颗");
        set("value", 5);
        set("food_remaining", 1);
        set("food_supply", 10);
        }
    setup();
}
