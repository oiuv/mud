//shenshe.c
inherit ITEM;
void create()
{
	set_name("引路神蛇", ({ "shen she", "snake"}));
	set_weight(100);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一条有识路能力的神蛇，可以把主人带到白"
		            "驼山。(键入home即可)\n");
		set("unit", "条");
		set("value", 0);
	}
}

void init()
{
	add_action("do_home", "home");
}

int do_home()
{
	string dir;
	object me = this_player();
        object env;

        env = environment(me);

        if (env->short() != "大沙漠")
                return notify_fail("使用引路神蛇必须在西域沙漠。\n");

        if ( me->query("family/family_name") !="欧阳世家")
	        return notify_fail("你挠挠脑袋，不知道怎么使用「引路神蛇」。\n");

	message_vision("$N从怀中掏出「引路神蛇」，口里不知念了些什么，\n"
	               "就见「引路神蛇」吐吐芯子，摇头摆尾地把$N往白驼山带去～～～\n",me);
	me->move("/d/baituo/damen");
	return 1;
}
