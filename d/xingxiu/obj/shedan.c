//  poison: shedan.c
// Jay 3/18/96

// more work needed to use this object to make poison

inherit ITEM;


void init()
{
        add_action("do_eat", "eat");
}

void create()
{
        set_name("毒蛇胆", ({"shedan", "dan"}));
        set("unit", "只");
        set("long", "这是一只绿莹莹的毒蛇胆，是制备毒药的原料。\n");
        set("value", 800);
        setup();
}

int do_eat(string arg)
{
        if (!id(arg))
                return notify_fail("你要吃什么？\n");
        return notify_fail("你找死啊。\n");
}

