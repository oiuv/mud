// shedan.c

inherit ITEM;

void create()
{
	set_name("腹蛇胆", ({"fushe dan", "dan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
        	set("unit", "枚");
		set("long", "这是一枚火红的腹蛇胆。\n");
		set("value", 500);
		set("only_do_effect", 1);
	}
        setup();
}

int do_effect(object me)
{
	message_vision("$N一口就把$n吞了下去。\n",
		       me, this_object());
	destruct(this_object());
        me->unconcious();
	return 1;
}

