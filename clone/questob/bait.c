// bait.c

inherit COMBINED_ITEM;

void create()
{
        set_name("鱼饵", ({ "bait", "yu er", "er" }));
        if(clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一袋新鲜的鱼饵。\n");
                set("base_unit", "袋");
                set("base_weight", 4000);
                set("no_sell", 1);
                set("unit", "堆");
        }

        set_amount(1);
        setup();
}
