// rice.c
// 1000 点重量合 1 斤

inherit COMBINED_ITEM;

void create()
{
        set_name("大米", ({ "rice", "da mi", "mi" }));
        if(clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一袋精制的大米。\n");
                set("base_unit", "袋");
                set("base_weight", 10000);
                set("no_sell", 1);
                set("unit", "些");
        }

        set_amount(1);
        setup();
}
