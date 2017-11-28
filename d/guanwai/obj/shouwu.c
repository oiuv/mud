// shouwu.c 何首乌

inherit ITEM;

void create()
{
	set_name("何首乌", ({"heshou wu", "wu"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "棵");
		set("long", "这是一棵初具人形的何首乌。\n");
		set("value", 10000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	me->add("max_neili", 1);
        if (me->query("max_neili") > me->query_neili_limit())
                me->set("max_neili", me->query_neili_limit());

	message_vision("$N吃下一棵何首乌，顿时间觉得全身充满了活力！\n", me);
	destruct(this_object());
	return 1;
}
