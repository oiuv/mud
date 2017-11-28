// lianzi.c 白莲子

inherit ITEM;

void create()
{
	set_name("白莲子", ({"bailian zi", "zi"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗洁白如玉的白莲子。\n");
		set("value", 2000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	if (me->query("potential") >= me->query_potential_limit())
		return notify_fail("你现在不需要用白莲子。\n");

        me->add("potential", 1);
        message_vision("$N吃下一颗白莲子，觉得一阵神清意爽！\n", me);
        destruct(this_object());
        return 1;
}
