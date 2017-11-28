// shouwu.c 何首乌

inherit ITEM;

void setup()
{}

void init()
{
	add_action("do_eat", "eat");
}

void create()
{
	set_name("何首乌", ({"heshou wu", "wu"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "棵");
		set("long", "这是一棵初具人形的何首乌。\n");
		set("value", 10000);
	}
	setup();
}

int do_eat(string arg)
{
	if (!id(arg))
	return notify_fail("你要吃什么？\n");

	this_player()->add("max_neili", 1);
	message_vision("$N吃下一棵何首乌，顿时间觉得全身充满了活力 !\n", this_player());
	destruct(this_object());
	return 1;
}

