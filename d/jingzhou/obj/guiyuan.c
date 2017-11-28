// guiyuan.c 归元丹

inherit ITEM;

void setup()
{}

void init()
{
	add_action("do_eat", "eat");
}

void create()
{
	set_name("归元丹", ({"guiyuan dan", "dan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗莹白溜圆的归元丹。\n");
		set("value", 10000);
	}
	setup();
}

int do_eat(string arg)
{
	if (!id(arg))
	return notify_fail("你要吃什么？\n");

	this_player()->add("neili", 200);
	message_vision("$N吃下一颗归元丹，只觉得四肢百骸真气充盈无比 !\n", this_player());
	destruct(this_object());
	return 1;
}


