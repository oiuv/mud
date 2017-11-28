// more work needed to use this object to make poison

inherit ITEM;


void init()
{
        add_action("do_eat", "eat");
}

void create()
{
	set_name("金蛇胆", ({"jin", "jin dan"}));
        set("unit", "只");
	set("long", "这是一只黄灿灿的金蛇胆，是制备『蛇胆膏』的原料。\n");
	set("value", 200);
        setup();
}

int do_eat(string arg)
{
	if (!id(arg))
                return notify_fail("你要吃什么？\n");
        return notify_fail("你找死啊。\n");
}
