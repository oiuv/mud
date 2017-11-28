// gold.c

inherit COMBINED_ITEM;

void create()
{
        set_name("金器", ({ "goldware", "jin qi", "gold" }));
        if(clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一副金制的器具。\n");
                set("base_unit", "副");
                set("base_weight", 12000);
                set("no_sell", 1);
                set("unit", "些");
        }

        set_amount(1);
        setup();
}
