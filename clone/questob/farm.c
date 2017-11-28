// farm.c

inherit COMBINED_ITEM;

void create()
{
        set_name("农具", ({ "farm tool", "nong ju", "tool" }));
        if(clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一副木制的农具。\n");
                set("base_unit", "副");
                set("base_weight", 8000);
                set("no_sell", 1);
                set("unit", "堆");
        }

        set_amount(1);
        setup();
}
