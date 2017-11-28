// spice.c

inherit COMBINED_ITEM;

void create()
{
        set_name("香料", ({ "spice", "xiang liao", "liao" }));
        if(clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一袋特制的香料。\n");
                set("base_unit", "袋");
                set("base_weight", 3000);
                set("no_sell", 1);
                set("unit", "堆");
        }

        set_amount(1);
        setup();
}
